import { ErrorEnum } from '@libs/common/constants/error.enum'
import { PaymentStatus } from '@libs/common/constants/payment-status.enum'
import { ListResponse } from '@libs/common/models'
import { Payment, PaymentType } from '@libs/entities/payment.entity'
import { User } from '@libs/entities/user.entity'
import { Voucher } from '@libs/entities/voucher.entity'
import { RequestContext } from '@libs/providers/request-context.provider'
import { StrapiClient } from '@libs/providers/strapi-client.provider'
import { CampaignResponse, CampaignResponseDataObject } from '@libs/repositories/strapi-api'
import { wildCardQuery } from '@libs/utilities/lang.util'
import { BadRequestException } from '@nestjs/common'
import { AxiosResponse } from 'axios'
import dayjs from 'dayjs'
import padStart from 'lodash/padStart'
import { defer, from, map, Observable, throwError } from 'rxjs'
import { DataSource, EntityManager, FindManyOptions, ILike, Repository } from 'typeorm'
import { v7 as uuidv7 } from 'uuid'
import { GetVoucherRequest } from './dto/voucher-request.request'

export class VoucherService {
    constructor(
        private readonly _strapiClient: StrapiClient,
        private readonly _requestContext: RequestContext,
        private readonly _voucherRepository: Repository<Voucher>,
        private readonly _paymentRepository: Repository<Payment>,
        private readonly _userRepository: Repository<User>,
        private readonly dataSource: DataSource,
    ) {}

    public getAllVouchers(query: GetVoucherRequest): Observable<ListResponse<Voucher>> {
        const where: FindManyOptions<Voucher> = {}

        if (query.campaignId) {
            where.where = {
                campaignId: query.campaignId,
            }
        }

        if (query.query) {
            where.where = {
                ...where.where,
                code: ILike(wildCardQuery(query.query)),
            }
        }

        return from(
            this._voucherRepository.findAndCount({
                ...where,
                skip: query.toSkip(),
                take: query.toTake(),
            }),
        ).pipe(
            map(
                ([
                    vouchers,
                    total,
                ]) => {
                    const listResponse: ListResponse<Voucher> = new ListResponse<Voucher>()
                    listResponse.data = vouchers
                    listResponse.limit = query.limit
                    listResponse.page = query.page
                    listResponse.total = total
                    return listResponse
                },
            ),
        )
    }

    public applyVoucher(code: string): Observable<{ status: boolean }> {
        if (!code) {
            return throwError(() => new BadRequestException(ErrorEnum.VOUCHER_CODE_NOT_FOUND))
        }

        if (code.length !== 10) {
            return throwError(() => new BadRequestException(ErrorEnum.VOUCHER_CODE_INVALID))
        }

        return defer(async () => {
            const queryRunner = this.dataSource.createQueryRunner()

            // Establish real database connection
            await queryRunner.connect()
            // Start a new transaction
            await queryRunner.startTransaction()

            try {
                let voucher = await queryRunner.manager.findOne(Voucher, { where: { code } })
                voucher = await this.validateVoucher(voucher)
                const [
                    validVoucher,
                    campaign,
                ] = await this.validateCampaign(voucher)
                const payment = await this.createVoucherTransaction(validVoucher, campaign, queryRunner.manager)
                await this.incrementVoucherUsage(validVoucher, queryRunner.manager)
                await this.addCoinToUser(payment.userId, validVoucher.coinGains, queryRunner.manager)

                // Commit the transaction
                await queryRunner.commitTransaction()

                return { status: true }
            } catch (error) {
                // Rollback the transaction in case of error
                await queryRunner.rollbackTransaction()
                throw error
            } finally {
                // Release the query runner
                await queryRunner.release()
            }
        })
    }

    private async validateVoucher(voucher: Voucher | null): Promise<Voucher> {
        if (!voucher) {
            throw new BadRequestException(ErrorEnum.VOUCHER_NOT_FOUND)
        }

        if (voucher.endDate && dayjs().isAfter(dayjs(voucher.endDate))) {
            throw new BadRequestException(ErrorEnum.VOUCHER_CODE_EXPIRED)
        }

        if (voucher.reusable === false && voucher.amountUsed > 0) {
            throw new BadRequestException(ErrorEnum.VOUCHER_CODE_USED)
        }

        const userId = this._requestContext?.identityInfo?.userId
        if (!userId) {
            throw new BadRequestException(ErrorEnum.JWT_PROFILE_INVALID)
        }

        const payment = await this._paymentRepository.findOne({
            where: {
                userId,
                voucher: {
                    code: voucher.code,
                },
                campaignId: voucher.campaignId,
                type: PaymentType.VOUCHER,
                paymentStatus: PaymentStatus.PAID,
            },
        })

        if (payment) {
            throw new BadRequestException(ErrorEnum.VOUCHER_CODE_USED)
        }

        return voucher
    }

    private async validateCampaign(voucher: Voucher): Promise<[Voucher, CampaignResponseDataObject]> {
        const response: AxiosResponse<CampaignResponse> = await this._strapiClient.campaignApi.getCampaignsId(
            voucher.campaignId,
        )
        const campaign: CampaignResponseDataObject = response?.data?.data

        if (!campaign) {
            throw new BadRequestException(ErrorEnum.CAMPAIGN_NOT_FOUND)
        }

        if (campaign.attributes.publishedAt === null) {
            throw new BadRequestException(ErrorEnum.CAMPAIGN_NOT_FOUND)
        }

        if (dayjs().isBefore(dayjs(campaign.attributes.startDate))) {
            throw new BadRequestException(ErrorEnum.CAMPAIGN_NOT_STARTED)
        }

        if (dayjs().isAfter(dayjs(campaign.attributes.endDate))) {
            throw new BadRequestException(ErrorEnum.CAMPAIGN_ENDED)
        }

        await this.checkCampaignQuota(voucher, campaign)
        return [
            voucher,
            campaign,
        ]
    }

    private async checkCampaignQuota(voucher: Voucher, campaign: CampaignResponseDataObject): Promise<void> {
        const vouchers = await this._voucherRepository.findBy({ campaignId: campaign.id })
        const amountUsed = vouchers.reduce((acc, v) => acc + v.amountUsed, 0)
        if (amountUsed >= campaign.attributes.quotas) {
            throw new BadRequestException(ErrorEnum.CAMPAIGN_QUOTA_REACHED)
        }
    }

    private async createVoucherTransaction(
        voucher: Voucher,
        campaign: CampaignResponseDataObject,
        manager: EntityManager,
    ): Promise<Payment> {
        const transactionId = this.generateTransactionId(voucher)
        const userId = this._requestContext.identityInfo.userId
        const payment = this._paymentRepository.create({
            transactionId,
            userId,
            voucher,
            campaignId: campaign.id,
            type: PaymentType.VOUCHER,
            coinGain: campaign.attributes.coinPerVoucher,
            paymentStatus: PaymentStatus.PAID,
        })
        return await manager.save(payment)
    }

    private async incrementVoucherUsage(voucher: Voucher, manager: EntityManager): Promise<void> {
        await manager.increment(Voucher, { code: voucher.code }, 'amountUsed', 1)
    }

    private async addCoinToUser(userId: string, coin: number, manager: EntityManager): Promise<void> {
        if (!coin) {
            throw new BadRequestException('Failed to add coin to user: Coin is not defined')
        }
        await manager.increment(User, { id: userId }, 'remainCoins', coin)
    }

    private generateTransactionId(voucher: Voucher): string {
        const ts = dayjs()
        return `${ts.format('YYYYMMDDHHmmssSSS')}-VO${padStart(String(voucher.code), 12, '0')}${uuidv7()}`
    }
}

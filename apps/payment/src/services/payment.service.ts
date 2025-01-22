import { Payment } from '@libs/entities/payment.entity'
import {
    BadRequestException,
    Logger,
    LoggerService,
} from '@nestjs/common'
import dayjs from 'dayjs'
import {
    catchError,
    from,
    map,
    mergeMap,
    Observable,
    of,
    tap,
    throwError,
} from 'rxjs'
import {
    In,
    Repository,
} from 'typeorm'
import { IPaymentService } from './interfaces/service.interface'
import { RequestContext } from '@libs/providers/request-context.provider'
import { CheckoutPackageResponse } from './dto/checkout-package.response'
import _ from 'lodash'
import { StrapiClient } from '@libs/providers/strapi-client.provider'
import { PaymentStatus } from '@libs/common/constants/payment-status.enum'
import {
    instanceToPlain,
    plainToInstance,
} from 'class-transformer'
import { CheckoutPackageRequest } from './dto/checkout-package.request'
import { ErrorEnum } from '@libs/common/constants/error.enum'
import {
    ListResponse,
    Pagination,
} from '@libs/common/models'
import { PaymentHistoryDto } from './dto/payment-history.dto'
import { IOpenBanking } from '@libs/repositories/interfaces/openbanking/open-banking.interface'
import Decimal from 'decimal.js'
import { generateRandomAlphanumeric } from '@libs/utilities/random.util'
import { PaymentPayload } from './dto/qr30-confirm.request'
import { PaymentTransaction } from '@libs/entities/payment-transaction.entity'
import { IQr30ConfirmResponse } from './dto/qr30-confirm.response'
import { IAmqpPublisher } from '@libs/providers/amqp/amqp-publisher.interface'
import { CheckoutCancelRequest } from './dto/checkout-cancel.request'
import { EventSubjectFactory } from '@libs/providers/event-subject.provider'

export class PaymentService implements IPaymentService {
    private readonly _logger: LoggerService

    public constructor(
        private readonly _paymentRepository: Repository<Payment>,
        private readonly _requestContext: RequestContext,
        private readonly _strapiClient: StrapiClient,
        private readonly _openBankingRepository: IOpenBanking,
        private readonly _vatPercentage: number,
        private readonly _paymentTransactionRepository: Repository<PaymentTransaction>,
        private readonly _publisher: IAmqpPublisher,
        private readonly _eventSubjectFactory: EventSubjectFactory
    ) {
        this._logger = new Logger(PaymentService.name)
    }

    public getPaymentHistories(pagination: Pagination): Observable<ListResponse<PaymentHistoryDto>> {
        const userId = this._requestContext.identityInfo.userId
        return from(this._paymentRepository.findAndCount({
            where: {
                userId,
                paymentStatus: In([PaymentStatus.PAID, PaymentStatus.CANCELLED, PaymentStatus.REJECTED]),
            },
            order: {updatedAt: 'desc'},
            take: pagination.toTake(),
            skip: pagination.toSkip(),
        })).pipe(
            map(([result, total]) => {
                const dto = new ListResponse<PaymentHistoryDto>()
                dto.total = total
                dto.page = pagination.page
                dto.limit = pagination.limit
                dto.data = result.map(v => {
                    const data: PaymentHistoryDto = {
                        paymentType: 'QR_PAYMENT',
                        transactionType: 'TOPUP',
                        transactionId: v.transactionId,
                        coinGain: v.coinGain,
                        price: v.total.toNumber(),
                        timestamp: v.updatedAt,
                    }
                    return plainToInstance(PaymentHistoryDto, data)
                })

                return dto
            })
        )
    }

    public getCheckoutById(id: string): Observable<CheckoutPackageResponse> {
        return from(this._paymentRepository.findOneBy({
            transactionId: id,
        })).pipe(
            mergeMap(result => {
                if (!result) {
                    return throwError(() => new BadRequestException(ErrorEnum.CHECKOUT_INVALID_PACKAGE))
                }

                return of(result)
            }),
            map(data => {
                return plainToInstance(CheckoutPackageResponse,
                    {
                        transactionId: data.transactionId,
                        expireAt: data.expiredAt,
                        packageId: data.coinPackageId,
                        total: data.total.toNumber(),
                        coinGain: data.coinGain,
                        coinBonus: data.coinBonus,
                        qrData: data.qrData,
                        paymentStatus: data.paymentStatus,
                    })
            }),
        )

    }

    public checkoutPackage(body: CheckoutPackageRequest): Observable<CheckoutPackageResponse> {
        const { packageId } = body

        const ts = dayjs()
        const expiredAt = ts.add(15, 'minutes')
        const idSum = this._requestContext.identityInfo.userId
            .replaceAll('-', '').split('')
            .reduce((acc, v) => acc + parseInt(v, 16), 0)
        const transactionId = `${ts.format('YYYYMMDDHHmmssSSS')}-TA${_.padStart(String(packageId), 2, '0')}${(Number(ts.format('SSS')) + idSum) % 1000}`

        return from(this._strapiClient.coinPackage.getCoinPackagesId(packageId)).pipe(
            catchError(() => throwError(() => new BadRequestException(ErrorEnum.CHECKOUT_INVALID_PACKAGE))),
            mergeMap(({ data }) => {

                const { price, coins, bonus, purchasable } = data.data.attributes

                if (!purchasable ||
                    price !== body.price ||
                    coins !== body.coinGain ||
                    bonus !== body.coinBonus
                ) {
                    return throwError(() => new BadRequestException(ErrorEnum.CHECKOUT_INVALID_PACKAGE))
                }

                return of(data)
            }),
            mergeMap(data => {
                const price =data.data.attributes.price
                const vat  = new Decimal(price).mul(this._vatPercentage).div(100).toDecimalPlaces(2, Decimal.ROUND_UP)

                const entity = this._paymentRepository.create({
                    transactionId,
                    userId: this._requestContext.identityInfo.userId,
                    total: data.data.attributes.price,
                    vat:vat.toNumber(),
                    ref1: transactionId.split('-')[0],
                    ref2: generateRandomAlphanumeric(20),
                    ref3: '', // leave empty for now
                    coinPackageId: data.data.id,
                    coinPackagePrice: data.data.attributes.price,
                    coinGain: data.data.attributes.coins,
                    coinBonus: data.data.attributes.bonus,
                    expiredAt: expiredAt.toDate(),
                    paymentStatus: PaymentStatus.PENDING,
                })

                return from(this._paymentRepository.save(entity)).pipe(
                    mergeMap(payment => this._paymentRepository.findOneBy({transactionId: payment.transactionId})),
                )
            }),
            mergeMap(payment => {
                return this._openBankingRepository.generateQrCode({
                    amount: payment.total.toNumber(),
                    ref1: payment.ref1,
                    ref2: payment.ref2,
                    ref3: generateRandomAlphanumeric(17),
                }).pipe(
                    mergeMap(qr => {
                        payment.ref3 = qr.ref3
                        payment.qrData = qr.data?.qrRawData
                        return from(this._paymentRepository.save(payment)).pipe(
                            map(payment => ({payment, qr}))
                        )
                    }),
                )
            }),
            map(({payment, qr}) => {
                return plainToInstance(CheckoutPackageResponse,
                    {
                        transactionId: payment.transactionId,
                        expiredAt: payment.expiredAt,
                        packageId: payment.coinPackageId,
                        total: payment.total.toNumber(),
                        coinGain: payment.coinGain,
                        coinBonus: payment.coinBonus,
                        qrData: qr.data.qrRawData,
                        paymentStatus: payment.paymentStatus,
                    })
            }),
        )

    }

    public qr30PaymentConfirm(body: PaymentPayload): Observable<IQr30ConfirmResponse> {
        return of(this._paymentTransactionRepository.create(body)).pipe(
            mergeMap(draft => {
                return this._paymentTransactionRepository.save(draft)
            }),
            tap(result => {
                return this._publisher.publish(instanceToPlain(result), 'payment.paid')
            }),
            map(result => {
                return {
                    resCode: '00',
                    resDesc: 'success',
                    transactionId: result.transactionId,
                    confirmId: result.id,
                }
            })
        )

    }

    public cancelCheckout(request: CheckoutCancelRequest): Observable<CheckoutPackageResponse> {

        return from(this._paymentRepository.findOneBy({
            transactionId: request.transactionId,
            coinPackageId: request.packageId,
            total: new Decimal(request.total),
            coinGain: request.coinGain,
            coinBonus: request.coinBonus,
            expiredAt: new Date(request.expiredAt),
        })).pipe(
            mergeMap(result => {
                if (!result) {
                    return throwError(() => new BadRequestException(ErrorEnum.CHECKOUT_NOT_FOUND))
                }

                return of(result)
            }),
            tap(data => {
                if (data.paymentStatus !== PaymentStatus.PENDING) {
                    throw new BadRequestException(ErrorEnum.CHECKOUT_ALREADY_PAID)
                }
            }),
            mergeMap(data => {
                data.paymentStatus = PaymentStatus.CANCELLED
                return from(this._paymentRepository.save(data))
            }),
            map(data => {
                this._eventSubjectFactory.push(data.transactionId, 'PAYMENT_UPDATE', {
                    transactionId: data.transactionId,
                    status: data.paymentStatus,
                    total: data.total.toNumber(),
                }, {delete: true})

                return plainToInstance(CheckoutPackageResponse,
                    {
                        transactionId: data.transactionId,
                        expireAt: data.expiredAt,
                        packageId: data.coinPackageId,
                        total: data.total.toNumber(),
                        coinGain: data.coinGain,
                        coinBonus: data.coinBonus,
                        qrData: data.qrData,
                        paymentStatus: data.paymentStatus,
                    })
            }),
        )
    }

}

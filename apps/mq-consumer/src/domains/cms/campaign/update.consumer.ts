import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { EXCHANGES, QUEUES } from '@libs/common/constants/mq-config.constant'
import { ProviderName } from '@libs/common/constants/providerName'
import { EnvironmentConfig } from '@libs/common/models'
import { Voucher } from '@libs/entities/voucher.entity'
import { CampaignCMS } from '@libs/repositories/interfaces/cms/campaign.interface'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { getRabbitSubscribeConfig, isValidMessage } from 'apps/mq-consumer/src/utils/consumer.util'
import { Repository } from 'typeorm'

const rabbitSubscribeConfig = getRabbitSubscribeConfig(
    QUEUES.CAMPAIGN_UPDATE,
    'campaign.updated',
    EXCHANGES.CAMPAIGN_DL,
    'campaign.updated.dlq',
)

@Injectable()
export class CampaignUpdateConsumer {
    private readonly _logger = new Logger(CampaignUpdateConsumer.name)
    private codeUsed: string[] = []

    constructor(
        @Inject(ProviderName.ENV_CONFIG)
        private readonly _envConfig: EnvironmentConfig,

        @Inject(ProviderName.VOUCHER_REPOSITORY)
        private readonly voucherRepository: Repository<Voucher>,
    ) {
        this._logger.log(this._envConfig.MESSAGE_BROKER_HOST)
    }
    @RabbitSubscribe(rabbitSubscribeConfig)
    public async pubSubHandler(msg: {}) {
        if (!isValidMessage(this._logger, msg, EXCHANGES.CAMPAIGN_DL)) {
            return new Nack()
        }

        const campaign: CampaignCMS = JSON.parse(JSON.stringify(msg['payload']))

        if (!campaign.publishedAt) {
            this._logger.log(`Campaign: ${campaign.name} is not published`)
            return
        }

        this._logger.log(`Received message: ${JSON.stringify(campaign, null, 2)}`)

        try {
            const allVouchers = await this.voucherRepository.find()
            const vouchers = allVouchers.filter((voucher) => voucher.campaignId === campaign.id)
            this.codeUsed = vouchers.map((voucher) => voucher.code)

            // Update all existing campaign in voucher
            await this.voucherRepository
                .createQueryBuilder()
                .update(Voucher)
                .set({
                    campaignId: campaign.id,
                    campaignName: campaign.name,
                    reusable: campaign.reusable,
                    coinGains: campaign.coinPerVoucher,
                    startDate: campaign.startDate,
                    endDate: campaign.endDate,
                })
                .where('campaignId = :campaignId', { campaignId: campaign.id })
                .execute()

            if (campaign.codeAmounts > vouchers.length) {
                // Generate new vouchers
                await this.generateVouchers(campaign, campaign.codeAmounts - vouchers.length)
            }

            this._logger.log(`Document updated successfully`)
        } catch (error) {
            console.error(error)
            this._logger.error(error)
            return new Nack()
        }
    }

    private async generateVouchers(campaign: CampaignCMS, amounts: number = 1) {
        const vouchersToCreate = []

        for (let i = 0; i < amounts; i++) {
            const code = await this.codeGenerator()

            vouchersToCreate.push({
                code,
                campaignId: campaign.id,
                campaignName: campaign.name,
                reusable: campaign.reusable,
                coinGains: campaign.coinPerVoucher,
                startDate: campaign.startDate,
                endDate: campaign.endDate,
            })
        }

        return this.voucherRepository.save(vouchersToCreate)
    }

    private async codeGenerator() {
        // Random 10 string, with All caps and numbers
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let code = ''
        for (let i = 0; i < 10; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length))
        }

        if (this.codeUsed.includes(code)) {
            return this.codeGenerator()
        }

        return code
    }
}

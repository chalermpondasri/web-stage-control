import { ProviderName } from '@libs/common/constants'
import { ICacheService } from '@libs/common/redis'
import { CoinConsumption } from '@libs/entities/coin-consumption.entity'
import { Payment } from '@libs/entities/payment.entity'
import { RequestContext } from '@libs/providers'
import { EncryptionService } from '@libs/providers/encryption.provider'
import { Provider } from '@nestjs/common'
import { Repository } from 'typeorm'
import { PaymentService } from '../domains/payment/payment.service'

export const paymentServiceProvider: Provider = {
    provide: ProviderName.PAYMENT_SERVICE,
    inject: [
        ProviderName.PAYMENT_REPOSITORY,
        ProviderName.REQUEST_CONTEXT,
        ProviderName.ENCRYPTION_SERVICE,
        ProviderName.CMS_REPOSITORY,
        ProviderName.USER_REPOSITORY,
        ProviderName.I18N_REPOSITORY,
        ProviderName.COIN_CONSUMPTION_REPOSITORY,
        ProviderName.CACHE_SERVICE,
    ],

    useFactory: (
        paymentRepository: Repository<Payment>,
        rc: RequestContext,
        enc: EncryptionService,
        coinConsumptionRepository: Repository<CoinConsumption>,
        cacheService: ICacheService,
    ) =>
        new PaymentService(
            paymentRepository,
            rc,
            enc,
            coinConsumptionRepository,
            cacheService,
        ),
}

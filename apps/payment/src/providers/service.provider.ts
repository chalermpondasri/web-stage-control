import { ProviderName } from '@libs/common/constants'
import { Payment } from '@libs/entities/payment.entity'
import { User } from '@libs/entities/user.entity'
import { Voucher } from '@libs/entities/voucher.entity'
import { RequestContext } from '@libs/providers/request-context.provider'
import { StrapiClient } from '@libs/providers/strapi-client.provider'
import { Provider } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { PackageService } from '../services/package.service'
import { PaymentService } from '../services/payment.service'
import { VoucherService } from '../services/voucher.service'
import { IOpenBanking } from '@libs/repositories/interfaces/openbanking/open-banking.interface'
import { EnvironmentConfig } from '@libs/common/models'
import { PaymentTransaction } from '@libs/entities/payment-transaction.entity'
import { IAmqpPublisher } from '@libs/providers/amqp/amqp-publisher.interface'
export const packageServiceProvider: Provider = {
    provide: ProviderName.PACKAGE_SERVICE,
    inject: [
        ProviderName.STRAPI_CLIENT,
    ],
    useFactory: (client: StrapiClient) => {
        return new PackageService(client)
    },
}

export const paymentServiceProvider: Provider = {
    provide: ProviderName.PAYMENT_SERVICE,
    inject: [
        ProviderName.PAYMENT_REPOSITORY,
        ProviderName.REQUEST_CONTEXT,
        ProviderName.STRAPI_CLIENT,
        ProviderName.OPEN_BANKING_REPOSITORY,
        ProviderName.ENV_CONFIG,
        ProviderName.PAYMENT_TRANSACTION_REPOSITORY,
        ProviderName.AMQP_PUBLISHER,
    ],
    useFactory: (
        paymentRepository: Repository<Payment>,
        requestContext: RequestContext,
        strapiClient: StrapiClient,
        openBankingRepository: IOpenBanking,
        config: EnvironmentConfig,
        paymentTransactionRepository: Repository<PaymentTransaction>,
        publisher: IAmqpPublisher,
    ) => {
        const vat = Number(config.VAT_PERCENTAGE)
        return new PaymentService(
            paymentRepository,
            requestContext,
            strapiClient,
            openBankingRepository,
            vat,
            paymentTransactionRepository,
            publisher,
            )
    },
}

export const voucherServiceProvider: Provider = {
    provide: ProviderName.VOUCHER_SERVICE,
    inject: [
        ProviderName.STRAPI_CLIENT,
        ProviderName.REQUEST_CONTEXT,
        ProviderName.VOUCHER_REPOSITORY,
        ProviderName.PAYMENT_REPOSITORY,
        ProviderName.USER_REPOSITORY,
        ProviderName.ORM_DATASOURCE,
    ],
    useFactory: (
        client: StrapiClient,
        requestContext: RequestContext,
        voucherRepository: Repository<Voucher>,
        paymentRepository: Repository<Payment>,
        userRepository: Repository<User>,
        dataSource: DataSource,
    ) => {
        return new VoucherService(
            client,
            requestContext,
            voucherRepository,
            paymentRepository,
            userRepository,
            dataSource,
        )
    },
}

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
    ],
    useFactory: (
        paymentRepository: Repository<Payment>,
        requestContext: RequestContext,
        strapiClient: StrapiClient,
    ) => {
        return new PaymentService(paymentRepository, requestContext, strapiClient)
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

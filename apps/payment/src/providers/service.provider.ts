import { Provider } from '@nestjs/common'
import { ProviderName } from '@libs/common/constants'
import { PackageService } from '../services/package.service'
import { StrapiClient } from '@libs/providers/strapi-client.provider'
import { PaymentService } from '../services/payment.service'
import { Repository } from 'typeorm'
import { Payment } from '@libs/entities/payment.entity'
import { RequestContext } from '@libs/providers/request-context.provider'

export const packageServiceProvider: Provider ={
    provide: ProviderName.PACKAGE_SERVICE,
    inject: [
        ProviderName.STRAPI_CLIENT,
    ],
    useFactory: (
        client: StrapiClient,
    ) => {
        return new PackageService(client)
    }
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
        strapiClient: StrapiClient
    ) => {
        return new PaymentService(
            paymentRepository,
            requestContext,
            strapiClient,
        )
    }
}
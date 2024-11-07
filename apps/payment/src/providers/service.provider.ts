import { Provider } from '@nestjs/common'
import { ProviderName } from '@libs/common/constants'
import { PackageService } from '../domains/payment/package.service'
import { StrapiClient } from '@libs/providers/strapi-client.provider'

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
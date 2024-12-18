import { Provider } from '@nestjs/common'
import { ProviderName } from '@libs/common/constants'
import { StrapiClient } from '@libs/providers/strapi-client.provider'
import { AnnouncementService } from '../domains/announcement/announcement.service'

export const announcementServiceProvider: Provider = {
    provide: ProviderName.ANNOUNCEMENT_SERVICE,
    inject: [
        ProviderName.STRAPI_CLIENT,
    ],
    useFactory: (
        client: StrapiClient,
    ) => new AnnouncementService(
        client,
    ),
}
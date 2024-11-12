import { ProviderName } from '@libs/common/constants/providerName'
import { Broadcast } from '@libs/entities/broadcast.entity'
import { Community } from '@libs/entities/community.entity'
import { BroadcastSseService } from '@libs/sse/broadcast.sse'
import { Provider } from '@nestjs/common'
import { BroadcastService } from 'apps/broadcast/src/domains/broadcast/broadcast.service'
import { Repository } from 'typeorm'
import { RequestContext } from './request-context.provider'
import { StrapiClient } from './strapi-client.provider'

export const broadcastServiceProvider: Provider = {
    provide: ProviderName.BROADCAST_SERVICE,
    inject: [
        ProviderName.STRAPI_CLIENT,
        ProviderName.BROADCAST_SSE,
        ProviderName.BROADCAST_REPOSITORY,
        ProviderName.COMMUNITY_REPOSITORY,
        ProviderName.REQUEST_CONTEXT,
    ],
    useFactory: (
        strapiClient: StrapiClient,
        broadcastSseService: BroadcastSseService,
        broadcastRepository: Repository<Broadcast>,
        communityRepository: Repository<Community>,
        requestContext: RequestContext,
    ) => {
        return new BroadcastService(
            strapiClient,
            broadcastSseService,
            broadcastRepository,
            communityRepository,
            requestContext,
        )
    },
}

export const broadcastSseProvider: Provider = {
    provide: ProviderName.BROADCAST_SSE,
    useFactory: () => new BroadcastSseService(),
}

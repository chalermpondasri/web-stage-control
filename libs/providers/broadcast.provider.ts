import { ProviderName } from '@libs/common/constants/providerName'
import { Broadcast } from '@libs/entities/broadcast.entity'
import { Community } from '@libs/entities/community.entity'
import { Transaction } from '@libs/entities/transaction.entity'
import { User } from '@libs/entities/user.entity'
import { BroadcastSseService } from '@libs/sse/broadcast.sse'
import { Provider } from '@nestjs/common'
import { BroadcastService } from 'apps/broadcast/src/domains/broadcast/broadcast.service'
import { DataSource, Repository } from 'typeorm'
import { RequestContext } from './request-context.provider'
import { StrapiClient } from './strapi-client.provider'

let broadcastService: BroadcastService = null

export const broadcastServiceProvider: Provider = {
    provide: ProviderName.BROADCAST_SERVICE,
    inject: [
        ProviderName.STRAPI_CLIENT,
        ProviderName.BROADCAST_SSE,
        ProviderName.BROADCAST_REPOSITORY,
        ProviderName.COMMUNITY_REPOSITORY,
        ProviderName.REQUEST_CONTEXT,
        ProviderName.USER_REPOSITORY,
        ProviderName.TRANSACTION_REPOSITORY,
        ProviderName.ORM_DATASOURCE,
    ],
    useFactory: (
        strapiClient: StrapiClient,
        broadcastSseService: BroadcastSseService,
        broadcastRepository: Repository<Broadcast>,
        communityRepository: Repository<Community>,
        requestContext: RequestContext,
        userRepository: Repository<User>,
        transactionRepository: Repository<Transaction>,
        dataSource: DataSource,
    ) => {
        if (broadcastService) {
            return broadcastService
        }
        broadcastService = new BroadcastService(
            strapiClient,
            broadcastSseService,
            broadcastRepository,
            communityRepository,
            requestContext,
            userRepository,
            transactionRepository,
            dataSource,
        )
    },
}

export const broadcastSseProvider: Provider = {
    provide: ProviderName.BROADCAST_SSE,
    useFactory: () => new BroadcastSseService(),
}

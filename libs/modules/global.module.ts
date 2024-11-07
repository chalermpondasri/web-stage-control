import { broadcastSseProvider } from '@libs/providers/broadcast.provider'
import { elasticClientProvider } from '@libs/providers/elastic-client.provider'
import { envConfigProvider } from '@libs/providers/env.provider'
import { eventSubjectProvider } from '@libs/providers/event-subject.provider'
import { httpClientProvider } from '@libs/providers/http-client.provider'
import { elasticRepositoryProviders, lineRepositoryProvider } from '@libs/providers/repository.provider'
import { requestContextProvider } from '@libs/providers/request-context.provider'
import { strapiClientProvider } from '@libs/providers/strapi-client.provider'
import { Global, Module } from '@nestjs/common'
import { tokenizationServiceProvider } from '../../apps/auth/src/providers/service.provider'

@Global()
@Module({
    providers: [
        envConfigProvider,
        httpClientProvider,
        lineRepositoryProvider,
        eventSubjectProvider,
        requestContextProvider,
        elasticClientProvider,
        ...elasticRepositoryProviders,
        requestContextProvider,
        strapiClientProvider,
        broadcastSseProvider,
        tokenizationServiceProvider,
    ],
    exports: [
        envConfigProvider,
        httpClientProvider,
        lineRepositoryProvider,
        eventSubjectProvider,
        requestContextProvider,
        elasticClientProvider,
        ...elasticRepositoryProviders,
        requestContextProvider,
        strapiClientProvider,
        broadcastSseProvider,
        tokenizationServiceProvider,
    ],
})
export class GlobalModule {}

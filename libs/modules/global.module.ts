import {
    Global,
    Module,
} from '@nestjs/common'
import { elasticClientProvider } from '@libs/providers/elastic-client.provider'
import { envConfigProvider } from '@libs/providers/env.provider'
import { eventSubjectProvider } from '@libs/providers/event-subject.provider'
import { requestContextProvider } from '@libs/providers/request-context.provider'
import { httpClientProvider } from '@libs/providers/http-client.provider'
import {
    elasticRepositoryProviders,
    lineRepositoryProvider,
} from '@libs/providers/repository.provider'
import { strapiClientProvider } from '@libs/providers/strapi-client.provider'
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
        tokenizationServiceProvider,
    ],
})

export class GlobalModule {
}

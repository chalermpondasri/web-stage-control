import {
    Global,
    MiddlewareConsumer,
    Module,
    NestModule,
} from '@nestjs/common'
import { elasticClientProvider } from '@libs/providers/elastic-client.provider'
import { envConfigProvider } from '@libs/providers/env.provider'
import { eventSubjectProvider } from '@libs/providers/event-subject.provider'
import {
    RequestContextMiddleware,
} from '@libs/providers/request-context.provider'
import { httpClientProvider } from '@libs/providers/http-client.provider'
import {
    elasticRepositoryProviders,
    lineRepositoryProvider,
    ormRepositoryProviders,
} from '@libs/providers/repository.provider'
import { requestContextProvider } from '@libs/providers/request-context.provider'
import { strapiClientProvider } from '@libs/providers/strapi-client.provider'
import { OrmModule } from '@libs/modules/orm.module'
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

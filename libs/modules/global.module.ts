import { elasticClientProvider } from '@libs/providers/elastic-client.provider'
import { envConfigProvider } from '@libs/providers/env.provider'
import { eventSubjectProvider } from '@libs/providers/event-subject.provider'
import { httpClientProvider } from '@libs/providers/http-client.provider'
import { lineRepositoryProvider, searchRepositoryProviders } from '@libs/providers/repository.provider'
import { Global, Module } from '@nestjs/common'
@Global()
@Module({
    providers: [
        envConfigProvider,
        httpClientProvider,
        lineRepositoryProvider,
        eventSubjectProvider,
        elasticClientProvider,
        ...searchRepositoryProviders,
    ],
    exports: [
        envConfigProvider,
        httpClientProvider,
        lineRepositoryProvider,
        eventSubjectProvider,
        elasticClientProvider,
        ...searchRepositoryProviders,
    ],
})
export class GlobalModule {}

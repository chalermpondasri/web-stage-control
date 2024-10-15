import { elasticClientProvider } from '@libs/providers/elastic-client.provider'
import { envConfigProvider } from '@libs/providers/env.provider'
import { eventSubjectProvider } from '@libs/providers/event-subject.provider'
import { httpClientProvider } from '@libs/providers/http-client.provider'
import { elasticRepositoryProviders, lineRepositoryProvider } from '@libs/providers/repository.provider'
import { Global, Module } from '@nestjs/common'
@Global()
@Module({
    providers: [
        envConfigProvider,
        httpClientProvider,
        lineRepositoryProvider,
        eventSubjectProvider,
        elasticClientProvider,
        ...elasticRepositoryProviders,
    ],
    exports: [
        envConfigProvider,
        httpClientProvider,
        lineRepositoryProvider,
        eventSubjectProvider,
        elasticClientProvider,
        ...elasticRepositoryProviders,
    ],
})
export class GlobalModule {}

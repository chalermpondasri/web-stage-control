import {
    Global,
    Module,
} from '@nestjs/common'
import { envConfigProvider } from '@libs/providers/env.provider'
import { httpClientProvider } from '@libs/providers/http-client.provider'
import { lineRepositoryProvider } from '@libs/providers/repository.provider'
import { eventSubjectProvider } from '@libs/providers/event-subject.provider'
@Global()
@Module({
    providers: [
        envConfigProvider,
        httpClientProvider,
        lineRepositoryProvider,
        eventSubjectProvider,
    ],
    exports: [
        envConfigProvider,
        httpClientProvider,
        lineRepositoryProvider,
        eventSubjectProvider,
    ]
})

export class GlobalModule {}
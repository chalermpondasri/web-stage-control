import {
    Global,
    Module,
    OnModuleInit,
} from '@nestjs/common'
import { envConfigProvider } from '@libs/providers/env.provider'
import { httpClientProvider } from '@libs/providers/http-client.provider'
import { lineRepositoryProvider } from '@libs/providers/repository.provider'
@Global()
@Module({
    providers: [
        envConfigProvider,
        httpClientProvider,
        lineRepositoryProvider,
    ],
    exports: [
        envConfigProvider,
        httpClientProvider,
        lineRepositoryProvider,
    ]
})

export class GlobalModule {}
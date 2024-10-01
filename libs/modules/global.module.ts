import {
    Global,
    Module,
    OnModuleInit,
} from '@nestjs/common'
import { envConfigProvider } from '@libs/providers/env.provider'
@Global()
@Module({
    providers: [
        envConfigProvider,
    ],
    exports: [
        envConfigProvider,
    ]
})

export class GlobalModule {}
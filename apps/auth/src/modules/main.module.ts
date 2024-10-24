import { Module } from '@nestjs/common'
import { OrmModule } from '@libs/modules/orm.module'
import { GlobalModule } from '@libs/modules/global.module'
import {
    authenticationServiceProvider,
    tokenizationServiceProvider,
    userServiceProvider,
} from '../providers/service.provider'
import { encryptionServiceProvider } from '@libs/providers/encryption.provider'
import { AdminController } from '../controllers/admin.controller'
import { UserController } from '../controllers/user.controller'
import { SseController } from '../controllers/sse.controller'

@Module({
    imports: [
        GlobalModule,
        OrmModule,
    ],
    providers: [
        encryptionServiceProvider,
        authenticationServiceProvider,
        tokenizationServiceProvider,
        userServiceProvider,
    ],
    controllers: [
        AdminController,
        UserController,
        SseController,
    ]
})
export class MainModule {

}
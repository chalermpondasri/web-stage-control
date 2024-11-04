import {
    MiddlewareConsumer,
    Module,
    NestModule,
} from '@nestjs/common'
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
import { PaymentModule } from './payment.module'
import { RequestContextMiddleware } from '@libs/providers/request-context.provider'
import { MeController } from '../controllers/me.controller'

@Module({
    imports: [
        GlobalModule,
        OrmModule,
        PaymentModule,
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
        MeController,
        SseController,
    ],
})
export class MainModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(RequestContextMiddleware).forRoutes('*')
    }

}
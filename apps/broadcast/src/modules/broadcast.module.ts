import { GlobalModule } from '@libs/modules/global.module'
import { OrmModule } from '@libs/modules/orm.module'
import { broadcastServiceProvider } from '@libs/providers/broadcast.provider'
import { RequestContextMiddleware } from '@libs/providers/request-context.provider'
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { tokenizationServiceProvider, userServiceProvider } from 'apps/auth/src/providers/service.provider'
import { BroadcastController } from '../controllers/broadcast.controller'
import { badWordProvider } from '@libs/providers/bad-word.provider'

@Module({
    imports: [
        GlobalModule,
        OrmModule,
    ],
    controllers: [
        BroadcastController,
    ],
    providers: [
        broadcastServiceProvider,
        tokenizationServiceProvider,
        userServiceProvider,
        badWordProvider
    ],
})
export class BroadcastModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(RequestContextMiddleware).forRoutes('*')
    }
}

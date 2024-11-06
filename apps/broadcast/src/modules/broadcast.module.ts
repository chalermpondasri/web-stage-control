import { GlobalModule } from '@libs/modules/global.module'
import { OrmModule } from '@libs/modules/orm.module'
import { RequestContextMiddleware } from '@libs/providers/request-context.provider'
import { BroadcastSseService } from '@libs/sse/broadcast.sse'
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { tokenizationServiceProvider, userServiceProvider } from 'apps/auth/src/providers/service.provider'
import { BroadcastController } from '../controllers/broadcast.controller'
import { BroadcastService } from '../domains/broadcast/broadcast.service'

@Module({
    imports: [
        GlobalModule,
        OrmModule,
    ],
    controllers: [
        BroadcastController,
    ],
    providers: [
        BroadcastService,
        BroadcastSseService,
        tokenizationServiceProvider,
        userServiceProvider,
    ],
})
export class BroadcastModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(RequestContextMiddleware).forRoutes('*')
    }
}

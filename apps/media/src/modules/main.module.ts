import {
    MiddlewareConsumer,
    Module,
    NestModule,
} from '@nestjs/common'
import { CommunityController } from '../controllers/community.controller'
import { playlistServiceProvider } from '../providers/service.provider'
import { OrmModule } from '@libs/modules/orm.module'
import { GlobalModule } from '@libs/modules/global.module'
import { RequestContextMiddleware } from '@libs/providers/request-context.provider'

@Module({
    imports: [
        OrmModule,
        GlobalModule,
    ],
    controllers: [
        CommunityController,
    ],
    providers: [
        playlistServiceProvider,
    ],
})
export class MainModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        consumer.apply(RequestContextMiddleware).forRoutes('*')
    }
}
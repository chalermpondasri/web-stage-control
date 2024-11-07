import {
    MiddlewareConsumer,
    Module,
    NestModule,
} from '@nestjs/common'
import { CommunityController } from '../controllers/community.controller'
import {
    boostServiceProvider,
    playlistServiceProvider,
} from '../providers/service.provider'
import { OrmModule } from '@libs/modules/orm.module'
import { GlobalModule } from '@libs/modules/global.module'
import { RequestContextMiddleware } from '@libs/providers/request-context.provider'
import { BoostController } from '../controllers/boost.controller'
import { PlaylistController } from '../controllers/playlist.controller'

@Module({
    imports: [
        OrmModule,
        GlobalModule,
    ],
    controllers: [
        CommunityController,
        BoostController,
        PlaylistController,
    ],
    providers: [
        playlistServiceProvider,
        boostServiceProvider,
    ],
})
export class MainModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        consumer.apply(RequestContextMiddleware).forRoutes('*')
    }
}
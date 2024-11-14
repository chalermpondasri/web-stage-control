import {
    MiddlewareConsumer,
    Module,
    NestModule,
    RequestMethod,
} from '@nestjs/common'
import { CommunityController } from '../controllers/community.controller'
import {
    boostServiceProvider,
    playlistServiceProvider,
    stageServiceProvider,
} from '../providers/service.provider'
import { OrmModule } from '@libs/modules/orm.module'
import { GlobalModule } from '@libs/modules/global.module'
import { RequestContextMiddleware } from '@libs/providers/request-context.provider'
import { BoostController } from '../controllers/boost.controller'
import { PlaylistController } from '../controllers/playlist.controller'
import { RouteInfo } from '@nestjs/common/interfaces'

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
        stageServiceProvider,
    ],
})
export class MainModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        const excludeRouteInfo: RouteInfo[] = [
            {
                path: '/communities/(.*)/(play|pause|stop)/(.*)',
                method: RequestMethod.ALL,
            }
        ]
        consumer.apply(RequestContextMiddleware)
            .exclude(...excludeRouteInfo)
            .forRoutes('*')
    }
}
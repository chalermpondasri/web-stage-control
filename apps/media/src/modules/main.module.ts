import {
    MiddlewareConsumer,
    Module,
    NestModule,
    RequestMethod,
} from '@nestjs/common'
import { CommunityController } from '../controllers/community.controller'
import {
    boostServiceProvider,
    mediaServiceProvider,
    playlistServiceProvider,
    stageServiceProvider,
} from '../providers/service.provider'
import { OrmModule } from '@libs/modules/orm.module'
import { GlobalModule } from '@libs/modules/global.module'
import { RequestContextMiddleware } from '@libs/providers/request-context.provider'
import { BoostController } from '../controllers/boost.controller'
import { PlaylistController } from '../controllers/playlist.controller'
import { RouteInfo } from '@nestjs/common/interfaces'
import { RootController } from '../controllers/root.controller'
import { loggingDiscordProvider } from '@libs/providers/logging-discord.provider'

@Module({
    imports: [
        OrmModule,
        GlobalModule,
    ],
    controllers: [
        CommunityController,
        BoostController,
        PlaylistController,
        RootController,
    ],
    providers: [
        playlistServiceProvider,
        boostServiceProvider,
        stageServiceProvider,
        mediaServiceProvider,
        loggingDiscordProvider,
    ],
})
export class MainModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        const excludeRouteInfo: RouteInfo[] = [
            {
                path: '/communities/(.*)/(play|pause)/(.*)',
                method: RequestMethod.ALL,
            },
            {

                path: '/playlist/(.*)',
                method: RequestMethod.ALL,
            },
            {
                path: '/(.*)',
                method: RequestMethod.GET,
            },
            {
                path: '/communities/(.*)/logging',
                method: RequestMethod.POST,
            }

        ]
        consumer.apply(RequestContextMiddleware)
            .exclude(...excludeRouteInfo)
            .forRoutes('*')
    }
}
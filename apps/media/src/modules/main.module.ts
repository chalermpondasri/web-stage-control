import {
    MiddlewareConsumer,
    Module,
    NestModule,
    RequestMethod,
} from '@nestjs/common'
import { CommunityController } from '../controllers/community.controller'
import {
    adsServiceProvider,
    backdropServiceProvider,
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
import { AdsController } from '../controllers/ads.controller'
import { CacheModule } from '@libs/modules/cache.module'
import { loggingDiscordProvider } from '@libs/providers/logging-discord.provider'
import { BackdropController } from '../controllers/backdrop.controller'
import { AmqpModule } from '@libs/modules/amqp.module'
import { BoostConsumer } from '../services/boost.consumer'

@Module({
    imports: [
        OrmModule,
        GlobalModule,
        AmqpModule,
        CacheModule,
    ],
    controllers: [
        CommunityController,
        BoostController,
        PlaylistController,
        AdsController,
        BackdropController,
        RootController, // stay at the bottom
    ],
    providers: [
        playlistServiceProvider,
        boostServiceProvider,
        stageServiceProvider,
        mediaServiceProvider,
        loggingDiscordProvider,
        adsServiceProvider,
        backdropServiceProvider,
        BoostConsumer,
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
                path: '/backdrops(.*)',
                method: RequestMethod.ALL,
            },
            {
                path: '/communities/(.*)/logging',
                method: RequestMethod.POST,
            },
            {
                path: '/(.*)',
                method: RequestMethod.GET,
            },

        ]
        consumer.apply(RequestContextMiddleware)
            .exclude(...excludeRouteInfo)
            .forRoutes('*')
    }
}
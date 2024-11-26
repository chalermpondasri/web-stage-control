import {
    MiddlewareConsumer,
    Module,
    NestModule,
} from '@nestjs/common'
import { OrmModule } from '@libs/modules/orm.module'
import { GlobalModule } from '@libs/modules/global.module'
import {
    authenticationServiceProvider,
    communityServiceProvider,
    rankingServiceProvider,
    tokenizationServiceProvider,
    userServiceProvider,
} from '../providers/service.provider'
import { encryptionServiceProvider } from '@libs/providers/encryption.provider'
import { AdminController } from '../controllers/admin.controller'
import { UserController } from '../controllers/user.controller'
import { RequestContextMiddleware } from '@libs/providers/request-context.provider'
import { MeController } from '../controllers/me.controller'
import { RankingController } from '../controllers/ranking.controller'
import { CommunityController } from '../controllers/community.controller'

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
        rankingServiceProvider,
        communityServiceProvider,
    ],
    controllers: [
        AdminController,
        UserController,
        MeController,
        RankingController,
        CommunityController,
    ],
})
export class MainModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(RequestContextMiddleware).forRoutes('*')
    }

}
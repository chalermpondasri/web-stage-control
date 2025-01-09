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
    notifierServiceProvider,
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
import { MailerModule } from '@libs/modules/mailer.module'
import { badWordProvider } from '@libs/providers/bad-word.provider'
import { appleIntegrationProvider } from '@libs/providers/apple-integration.provider'

@Module({
    imports: [
        GlobalModule,
        OrmModule,
        MailerModule,
    ],
    providers: [
        encryptionServiceProvider,
        authenticationServiceProvider,
        tokenizationServiceProvider,
        userServiceProvider,
        rankingServiceProvider,
        communityServiceProvider,
        notifierServiceProvider,
        badWordProvider,
        appleIntegrationProvider,
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
import { GlobalModule } from '@libs/modules/global.module'
import { OrmModule } from '@libs/modules/orm.module'
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { RequestContextMiddleware } from '@libs/providers/request-context.provider'
import { packageServiceProvider } from '../providers/service.provider'
import { PackageController } from '../controllers/package.controller'

@Module({
    imports: [
        GlobalModule,
        OrmModule,
    ],
    providers: [
        packageServiceProvider,
    ],
    controllers: [
        PackageController,
    ],
})
export class PaymentModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        consumer.apply( RequestContextMiddleware).forRoutes('*')
    }
}

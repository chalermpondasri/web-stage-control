import { GlobalModule } from '@libs/modules/global.module'
import { OrmModule } from '@libs/modules/orm.module'
import { RequestContextMiddleware } from '@libs/providers/request-context.provider'
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { PackageController } from '../controllers/package.controller'
import { RootController } from '../controllers/root.controller'
import { VoucherController } from '../controllers/voucher.controller'
import { packageServiceProvider, paymentServiceProvider, voucherServiceProvider } from '../providers/service.provider'

@Module({
    imports: [
        GlobalModule,
        OrmModule,
    ],
    providers: [
        packageServiceProvider,
        paymentServiceProvider,
        voucherServiceProvider,
    ],
    controllers: [
        PackageController,
        RootController,
        VoucherController,
    ],
})
export class PaymentModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        consumer.apply(RequestContextMiddleware).forRoutes('*')
    }
}

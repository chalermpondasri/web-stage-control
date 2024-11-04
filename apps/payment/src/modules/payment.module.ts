import { GlobalModule } from '@libs/modules/global.module'
import { OrmModule } from '@libs/modules/orm.module'
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { PaymentController } from '../controllers/payment.controller'
import { SubscribeController } from '../controllers/subscribe.controller'
import { paymentServiceProvider } from '../providers/service.provider'
import { RequestContextMiddleware } from '@libs/providers/request-context.provider'

@Module({
    imports: [GlobalModule, OrmModule],
    providers: [paymentServiceProvider],
    controllers: [PaymentController, SubscribeController],
})
export class PaymentModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        consumer.apply( RequestContextMiddleware).forRoutes('*')
    }
}

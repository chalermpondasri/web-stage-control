import { GlobalModule } from '@libs/modules/global.module'
import { OrmModule } from '@libs/modules/orm.module'
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { PaymentController } from '../controllers/payment.controller'
import { RequestContextMiddleware } from '@libs/providers/request-context.provider'

@Module({
    imports: [GlobalModule, OrmModule],
    providers: [],
    controllers: [PaymentController],
})
export class PaymentModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        consumer.apply( RequestContextMiddleware).forRoutes('*')
    }
}

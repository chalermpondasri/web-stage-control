import { GlobalModule } from '@libs/modules/global.module'
import { Module } from '@nestjs/common'
import { SearchModule } from './search.module'

@Module({
    imports: [
        GlobalModule,
        SearchModule,
    ],
})
export class MainModule {}
// export class MainModule implements NestModule {
//     public configure(consumer: MiddlewareConsumer): any {
//         consumer.apply(HeaderValidationMiddleware, RequestContextMiddleware, ElasticHttpLoggerMiddleware).forRoutes('*')
//     }
// }

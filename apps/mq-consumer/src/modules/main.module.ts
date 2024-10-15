import { Module } from '@nestjs/common'
import { MqConsumerModule } from './mq-consumer.module'

@Module({
    imports: [
        MqConsumerModule,
    ],
})
export class MainModule {}

import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { EXCHANGES } from '@libs/common/constants/mq-config'
import { ProviderName } from '@libs/common/constants/providerName'
import { EnvironmentConfig } from '@libs/common/models'
import { GlobalModule } from '@libs/modules/global.module'
import { envConfigProvider } from '@libs/providers/env.provider'
import { Module } from '@nestjs/common'
import { TrackConsumer } from '../domains/cms/track.consumer'

@Module({
    imports: [
        GlobalModule,
        RabbitMQModule.forRootAsync(RabbitMQModule, {
            useFactory: (envConfig: EnvironmentConfig) => {
                let uri = `amqp://${envConfig.MESSAGE_BROKER_USERNAME}:${envConfig.MESSAGE_BROKER_PASSWORD}@${envConfig.MESSAGE_BROKER_HOST}:${envConfig.MESSAGE_BROKER_PORT}`
                return {
                    exchanges: [
                        {
                            name: EXCHANGES.TRACK,
                            type: 'topic',
                            options: {
                                durable: true,
                            },
                        },
                        // {
                        //     name: EXCHANGES.TRACK_DL,
                        //     type: 'fanout',
                        //     options: {
                        //         durable: true,
                        //     },
                        // },
                    ],
                    uri,
                    connectionInitOptions: { wait: true },
                }
            },
            inject: [ProviderName.ENV_CONFIG],
        }),
    ],
    controllers: [],

    // TODO:: ลอง set ให้ vscode มันตีบรรทัดลงมาให้
    providers: [envConfigProvider, TrackConsumer],
})
export class MqConsumerModule {}

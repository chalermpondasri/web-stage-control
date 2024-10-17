import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { EXCHANGES } from '@libs/common/constants/mq-config.constant'
import { ProviderName } from '@libs/common/constants/providerName'
import { EnvironmentConfig } from '@libs/common/models'
import { GlobalModule } from '@libs/modules/global.module'
import { envConfigProvider } from '@libs/providers/env.provider'
import { Module } from '@nestjs/common'
import { TrackCreateConsumer } from '../domains/cms/track/create.consumer'
import { TrackDeleteConsumer } from '../domains/cms/track/delete.consumer'
import { TrackUpdateConsumer } from '../domains/cms/track/update.consumer'

@Module({
    imports: [
        GlobalModule,
        RabbitMQModule.forRootAsync(RabbitMQModule, {
            useFactory: (envConfig: EnvironmentConfig) => {
                let uri = `amqp://${envConfig.MESSAGE_BROKER_USERNAME}:${envConfig.MESSAGE_BROKER_PASSWORD}@${envConfig.MESSAGE_BROKER_HOST}:${envConfig.MESSAGE_BROKER_PORT}/${envConfig.MESSAGE_BROKER_VIRTUAL_HOST}`

                return {
                    exchanges: [
                        {
                            name: envConfig.NODE_ENV + '_' + EXCHANGES.EVENT_BUS,
                            type: 'topic',
                            options: { durable: true },
                        },
                        // {
                        //     name: EXCHANGES.TRACK_DL,
                        //     type: 'fanout',
                        //     options: {durable: true},
                        // },
                    ],
                    uri,
                    connectionInitOptions: { wait: true },
                }
            },
            inject: [
                ProviderName.ENV_CONFIG,
            ],
        }),
    ],
    controllers: [],
    providers: [
        envConfigProvider,
        TrackCreateConsumer,
        TrackUpdateConsumer,
        TrackDeleteConsumer,
    ],
})
export class MqConsumerModule {}

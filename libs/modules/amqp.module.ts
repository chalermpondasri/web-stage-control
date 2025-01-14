import { Module } from '@nestjs/common'
import {
    amqpPublisherProvider,
} from '@libs/providers/amqp.provider'
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import {
    EXCHANGES,
    ProviderName,
} from '@libs/common/constants'
import { EnvironmentConfig } from '@libs/common/models'

@Module({
    imports: [
        RabbitMQModule.forRootAsync(RabbitMQModule, {
            inject: [
                ProviderName.ENV_CONFIG,
            ],
            useFactory: (envConfig: EnvironmentConfig) => {
                let uri = `amqp://${envConfig.MESSAGE_BROKER_USERNAME}:${envConfig.MESSAGE_BROKER_PASSWORD}@${envConfig.MESSAGE_BROKER_HOST}:${envConfig.MESSAGE_BROKER_PORT}/${envConfig.MESSAGE_BROKER_VIRTUAL_HOST}`

                return {
                    queues: [
                        {
                            name: `${envConfig.NODE_ENV}_payment_boost`,
                            options: {
                                durable: true,
                                arguments: {
                                    'x-single-active-consumer': true,
                                },
                            }
                        }
                    ],
                    exchanges: [
                        {
                            name: envConfig.NODE_ENV + '_' + EXCHANGES.EVENT_BUS,
                            type: 'topic',
                            options: { durable: true },
                        },
                    ],
                    uri,
                    connectionInitOptions: { wait: true },
                }
            },

        }),
    ],
    providers: [
        amqpPublisherProvider,
    ],
    exports: [
        amqpPublisherProvider,
    ]
})
export class AmqpModule {}
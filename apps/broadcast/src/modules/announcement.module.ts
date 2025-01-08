import { Module } from '@nestjs/common'
import { GlobalModule } from '@libs/modules/global.module'
import { OrmModule } from '@libs/modules/orm.module'
import { AnnouncementController } from '../controllers/announcement.controller'
import { announcementServiceProvider } from '../providers/service.provider'
import { AnnouncementUpdateConsumer } from '../domains/announcement/announcement.update.consumer'
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { EnvironmentConfig } from '@libs/common/models'
import {
    EXCHANGES,
    ProviderName,
} from '@libs/common/constants'

@Module({
    imports: [
        GlobalModule,
        RabbitMQModule.forRootAsync(RabbitMQModule, {
            inject: [
                ProviderName.ENV_CONFIG,
            ],
            useFactory: (envConfig: EnvironmentConfig) => {
                let uri = `amqp://${envConfig.MESSAGE_BROKER_USERNAME}:${envConfig.MESSAGE_BROKER_PASSWORD}@${envConfig.MESSAGE_BROKER_HOST}:${envConfig.MESSAGE_BROKER_PORT}/${envConfig.MESSAGE_BROKER_VIRTUAL_HOST}`

                return {
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
        OrmModule,
    ],
    providers: [
        announcementServiceProvider,
        AnnouncementUpdateConsumer,
    ],
    controllers: [
        AnnouncementController,
    ]
})
export class AnnouncementModule {}
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { EXCHANGES } from '@libs/common/constants/mq-config.constant'
import { ProviderName } from '@libs/common/constants/providerName'
import { EnvironmentConfig } from '@libs/common/models'
import { GlobalModule } from '@libs/modules/global.module'
import { OrmModule } from '@libs/modules/orm.module'
import { envConfigProvider } from '@libs/providers/env.provider'
import { Module } from '@nestjs/common'
import { AlbumCreateConsumer } from '../domains/cms/album/create.consumer'
import { AlbumDeleteConsumer } from '../domains/cms/album/delete.consumer'
import { AlbumUpdateConsumer } from '../domains/cms/album/update.consumer'
import { ArtistCreateConsumer } from '../domains/cms/artist/create.consumer'
import { ArtistDeleteConsumer } from '../domains/cms/artist/delete.consumer'
import { ArtistUpdateConsumer } from '../domains/cms/artist/update.consumer'
import { CampaignUpdateConsumer } from '../domains/cms/campaign/update.consumer'
import { TrackCreateConsumer } from '../domains/cms/track/create.consumer'
import { TrackDeleteConsumer } from '../domains/cms/track/delete.consumer'
import { TrackUpdateConsumer } from '../domains/cms/track/update.consumer'
import { AnnouncementUpdateConsumer } from '../domains/cms/announcement/announcement.update.consumer'

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
                    ],
                    uri,
                    connectionInitOptions: { wait: true },
                }
            },
            inject: [
                ProviderName.ENV_CONFIG,
            ],
        }),
        OrmModule,
    ],
    controllers: [],
    providers: [
        envConfigProvider,
        TrackCreateConsumer,
        TrackUpdateConsumer,
        TrackDeleteConsumer,
        AlbumCreateConsumer,
        AlbumUpdateConsumer,
        AlbumDeleteConsumer,
        ArtistCreateConsumer,
        ArtistUpdateConsumer,
        ArtistDeleteConsumer,
        CampaignUpdateConsumer,
        AnnouncementUpdateConsumer,
    ],
})
export class MqConsumerModule {}

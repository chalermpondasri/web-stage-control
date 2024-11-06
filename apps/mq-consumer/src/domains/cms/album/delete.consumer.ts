import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { EXCHANGES, QUEUES } from '@libs/common/constants/mq-config.constant'
import { ProviderName } from '@libs/common/constants/providerName'
import { EnvironmentConfig } from '@libs/common/models'
import { AlbumElasticRepository } from '@libs/repositories/elasticsearch/album.elastic.repository'
import { AlbumES } from '@libs/repositories/interfaces/search/album.interface'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConsumeMessage } from 'amqplib'
import { getRabbitSubscribeConfig, handleError, isValidMessage } from 'apps/mq-consumer/src/utils/consumer.util'
import { catchError, firstValueFrom } from 'rxjs'

const rabbitSubscribeConfig = getRabbitSubscribeConfig(
    QUEUES.ALBUM_DELETE,
    'album.deleted',
    EXCHANGES.ALBUM_DL,
    'album.deleted.dlq',
)

@Injectable()
export class AlbumDeleteConsumer {
    private readonly _logger = new Logger(AlbumDeleteConsumer.name)
    constructor(
        @Inject(ProviderName.ENV_CONFIG)
        private readonly _envConfig: EnvironmentConfig,

        @Inject(ProviderName.ALBUM_REPOSITORY)
        private albumRepository: AlbumElasticRepository,
    ) {
        this._logger.log(this._envConfig.MESSAGE_BROKER_HOST)
    }

    @RabbitSubscribe(rabbitSubscribeConfig)
    public async pubSubHandler(msg: {}, amqpMsg: ConsumeMessage) {
        if (!isValidMessage(this._logger, msg, EXCHANGES.ALBUM_DL)) {
            return new Nack()
        }

        const album: AlbumES = {} as AlbumES
        Object.assign(album, msg['payload'])

        this._logger.log(`Received message: ${JSON.stringify(msg, null, 2)}`)

        try {
            await firstValueFrom(
                this.albumRepository.deleteAlbum(album).pipe(
                    catchError((error) => {
                        handleError(this._logger, error, EXCHANGES.ALBUM_DL)
                        throw error
                    }),
                ),
            )
            this._logger.log(`Document deleted successfully`)
        } catch (error) {
            return new Nack()
        }
    }
}

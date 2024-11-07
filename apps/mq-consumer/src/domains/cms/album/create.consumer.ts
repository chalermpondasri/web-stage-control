import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { EXCHANGES, QUEUES } from '@libs/common/constants/mq-config.constant'
import { ProviderName } from '@libs/common/constants/providerName'
import { EnvironmentConfig } from '@libs/common/models'
import { AlbumElasticRepository } from '@libs/repositories/elasticsearch/album.elastic.repository'
import { AlbumES } from '@libs/repositories/interfaces/search/album.interface'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConsumeMessage } from 'amqplib'
import { getRabbitSubscribeConfig, handleError, isValidMessage } from 'apps/mq-consumer/src/utils/consumer.util'
import { AlbumEsDto } from 'apps/search/src/domains/album/dtos/album.dto'
import { catchError, firstValueFrom } from 'rxjs'

const rabbitSubscribeConfig = getRabbitSubscribeConfig(
    QUEUES.ALBUM_CREATE,
    'album.created',
    EXCHANGES.ALBUM_DL,
    'album.created.dlq',
)

@Injectable()
export class AlbumCreateConsumer {
    private readonly _logger = new Logger(AlbumCreateConsumer.name)
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

        const album = AlbumEsDto.toDto(msg['payload'] as AlbumES)

        this._logger.log(`Received message: ${JSON.stringify(msg, null, 2)}`)

        try {
            await firstValueFrom(
                this.albumRepository.addAlbum(album).pipe(
                    catchError((error) => {
                        handleError(this._logger, error, EXCHANGES.ALBUM_DL)
                        throw error
                    }),
                ),
            )
            this._logger.log(`Document created successfully`)
        } catch (error) {
            return new Nack()
        }
    }
}

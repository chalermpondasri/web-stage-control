import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { EXCHANGES, QUEUES } from '@libs/common/constants/mq-config.constant'
import { ProviderName } from '@libs/common/constants/providerName'
import { EnvironmentConfig } from '@libs/common/models'
import { AlbumElasticRepository } from '@libs/repositories/elasticsearch/album.elastic.repository'
import { AlbumES } from '@libs/repositories/interfaces/search/album.interface'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConsumeMessage } from 'amqplib'
import { AlbumEsDto } from 'apps/search/src/domains/album/dtos/album.dto'
import { catchError, firstValueFrom } from 'rxjs'

const rabbitSubscribeConfig = {
    exchange: `${process.env.NODE_ENV}_${EXCHANGES.EVENT_BUS}`,
    routingKey: 'album.created',
    queue: QUEUES.ALBUM_CREATE,
    queueOptions: {
        durable: true,
        autoDelete: false,
        exclusive: false,
        deadLetterExchange: EXCHANGES.ALBUM_DL,
        deadLetterRoutingKey: 'album.created.dlq',
    },
}

@Injectable()
export class AlbumCreateConsumer {
    private readonly _logger = new Logger(AlbumCreateConsumer.name)
    constructor(
        @Inject(ProviderName.ENV_CONFIG)
        private readonly _envConfig: EnvironmentConfig,

        @Inject(ProviderName.ALBUM_REPOSITORY)
        private albumRepository: AlbumElasticRepository,
    ) {}

    @RabbitSubscribe(rabbitSubscribeConfig)
    public async pubSubHandler(msg: {}, amqpMsg: ConsumeMessage) {
        if (!msg['payload']) {
            this._logger.error('Invalid message format: no payload')
            this._logger.error('Moving message to dead letter queue: ' + EXCHANGES.ALBUM_DL)
            return new Nack()
        }

        if (msg['event'] !== 'album.created') {
            this._logger.error('Invalid event type: ' + msg['event'])
            this._logger.error('Moving message to dead letter queue: ' + EXCHANGES.ALBUM_DL)
            return new Nack()
        }

        const album = AlbumEsDto.toDto(msg['payload'] as AlbumES)

        this._logger.log(`Received message: ${JSON.stringify(msg, null, 2)}`)

        try {
            await firstValueFrom(
                this.albumRepository.addAlbum(album).pipe(
                    catchError((error) => {
                        this._logger.error(`Error indexing document: ${error}`)
                        this._logger.error('Moving message to dead letter queue: ' + EXCHANGES.ARTIST_DL)
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

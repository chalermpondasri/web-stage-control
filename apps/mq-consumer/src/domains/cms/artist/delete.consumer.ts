import { Nack, RabbitHandlerConfig, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { EXCHANGES, QUEUES } from '@libs/common/constants/mq-config.constant'
import { ProviderName } from '@libs/common/constants/providerName'
import { EnvironmentConfig } from '@libs/common/models'
import { ArtistElasticRepository } from '@libs/repositories/elasticsearch/artist.elastic.repository'
import { ArtistES } from '@libs/repositories/interfaces/search/artist.interface'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConsumeMessage } from 'amqplib'
import { catchError, firstValueFrom } from 'rxjs'

const rabbitSubscribeConfig: Partial<RabbitHandlerConfig> = {
    exchange: `${process.env.NODE_ENV}_${EXCHANGES.EVENT_BUS}`,
    routingKey: 'artist.deleted',
    queue: QUEUES.ARTIST_DELETE,
    queueOptions: {
        durable: true,
        autoDelete: false,
        exclusive: false,
        deadLetterExchange: EXCHANGES.ARTIST_DL,
        deadLetterRoutingKey: 'artist.deleted.dlq',
    },
}

@Injectable()
export class ArtistDeleteConsumer {
    private readonly _logger = new Logger(ArtistDeleteConsumer.name)
    constructor(
        @Inject(ProviderName.ENV_CONFIG)
        private readonly _envConfig: EnvironmentConfig,

        @Inject(ProviderName.ARTIST_REPOSITORY)
        private artistRepository: ArtistElasticRepository,
    ) {}

    @RabbitSubscribe(rabbitSubscribeConfig)
    public async pubSubHandler(msg: {}, amqpMsg: ConsumeMessage) {
        if (!msg['payload']) {
            this._logger.error('Invalid message format: no payload')
            this._logger.error('Moving message to dead letter queue: ' + EXCHANGES.ARTIST_DL)
            return new Nack()
        }

        if (msg['event'] !== 'artist.deleted') {
            this._logger.error('Invalid event type: ' + msg['event'])
            this._logger.error('Moving message to dead letter queue: ' + EXCHANGES.ARTIST_DL)
            return new Nack()
        }

        const artist: ArtistES = {} as ArtistES
        Object.assign(artist, msg['payload'])

        this._logger.log(`Received message: ${JSON.stringify(msg, null, 2)}`)

        try {
            await firstValueFrom(
                this.artistRepository.deleteArtist(artist).pipe(
                    catchError((error) => {
                        this._logger.error(`Error deleting document: ${error}`)
                        this._logger.error('Moving message to dead letter queue: ' + EXCHANGES.ARTIST_DL)
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

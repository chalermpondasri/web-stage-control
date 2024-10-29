import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { EXCHANGES, QUEUES } from '@libs/common/constants/mq-config.constant'
import { ProviderName } from '@libs/common/constants/providerName'
import { EnvironmentConfig } from '@libs/common/models'
import { TrackElasticRepository } from '@libs/repositories/elasticsearch/track.elastic.repository'
import { TrackES } from '@libs/repositories/interfaces/search/track.interface'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConsumeMessage } from 'amqplib'
import { TrackEsDto } from 'apps/search/src/domains/track/dtos/track.dto'
import { catchError, firstValueFrom } from 'rxjs'

const rabbitSubscribeConfig = {
    exchange: `${process.env.NODE_ENV}_${EXCHANGES.EVENT_BUS}`,
    routingKey: 'track.created',
    queue: QUEUES.TRACK_CREATE,
    queueOptions: {
        durable: true,
        autoDelete: false,
        exclusive: false,
        deadLetterExchange: EXCHANGES.TRACK_DL,
    },
}

@Injectable()
export class TrackCreateConsumer {
    private readonly _logger = new Logger(TrackCreateConsumer.name)
    constructor(
        @Inject(ProviderName.ENV_CONFIG)
        private readonly _envConfig: EnvironmentConfig,

        @Inject(ProviderName.TRACK_REPOSITORY)
        private trackRepository: TrackElasticRepository,
    ) {}

    @RabbitSubscribe(rabbitSubscribeConfig)
    public async pubSubHandler(msg: {}, amqpMsg: ConsumeMessage) {
        if (!msg['payload']) {
            this._logger.error('Invalid message format: no payload')
            this._logger.error('Moving message to dead letter queue: ' + EXCHANGES.TRACK_DL)
            return new Nack()
        }

        if (msg['event'] !== 'track.created') {
            this._logger.error('Invalid event type: ' + msg['event'])
            this._logger.error('Moving message to dead letter queue: ' + EXCHANGES.TRACK_DL)
            return new Nack()
        }

        const track = TrackEsDto.toDto(msg['payload'] as TrackES)

        if (!track.publishedAt) {
            return
        }

        this._logger.log(`Received message: ${JSON.stringify(msg, null, 2)}`)

        try {
            await firstValueFrom(
                this.trackRepository.addTrack(track).pipe(
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

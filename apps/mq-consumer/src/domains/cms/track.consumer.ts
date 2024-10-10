import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { EXCHANGES, QUEUES } from '@libs/common/constants/mq-config'
import { ProviderName } from '@libs/common/constants/providerName'
import { EnvironmentConfig } from '@libs/common/models'
import { TrackElasticRepository } from '@libs/repositories/elasticsearch/track.elastic.repository'
import { TrackES } from '@libs/repositories/interfaces/search/track.interface'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConsumeMessage } from 'amqplib'

@Injectable()
export class TrackConsumer {
    private readonly _logger = new Logger(TrackConsumer.name)
    constructor(
        @Inject(ProviderName.ENV_CONFIG)
        private readonly _envConfig: EnvironmentConfig,

        @Inject(ProviderName.TRACK_REPOSITORY)
        private trackRepository: TrackElasticRepository,
    ) {
        this._logger.log(this._envConfig.MESSAGE_BROKER_HOST)
    }
    @RabbitSubscribe({
        exchange: EXCHANGES.TRACK,
        routingKey: '',
        queue: QUEUES.TRACK,
        queueOptions: {
            durable: true,
            autoDelete: false,
            exclusive: false,
            deadLetterExchange: EXCHANGES.TRACK_DL,
        },
    })
    public async pubSubHandler(msg: {}, amqpMsg: ConsumeMessage) {
        this._logger.log(`Received message: ${JSON.stringify(msg)}`)
        // TODO:: check track publish before add to elastic search
        if (!msg['payload']) {
            this._logger.error('Invalid message format: no payload')
            this._logger.error('Moving message to dead letter queue: ' + EXCHANGES.TRACK_DL)
            return new Nack()
        }

        // check if msg.event is one of track_created, track_updated, track_deleted
        if (!['track.created', 'track.updated', 'track.deleted'].includes(msg['event'])) {
            this._logger.error('Invalid event type: ' + msg['event'])
            this._logger.error('Moving message to dead letter queue: ' + EXCHANGES.TRACK_DL)
            return new Nack()
        }

        const track: TrackES = {} as TrackES
        Object.assign(track, msg['payload'])

        this.trackRepository.addTrack(track).subscribe({
            next: (value) => {
                this._logger.log(`Document indexed: ${JSON.stringify(value)}`)
            },
            error: (error) => {
                this._logger.error(`Error indexing document: ${error}`)
                // add error message to metadata and move to dead letter queue
                this._logger.error('Moving message to dead letter queue: ' + EXCHANGES.TRACK_DL)

                // TODO:: test this
                amqpMsg.properties.headers = {
                    ...amqpMsg.properties.headers,
                    error: error.message,
                }
                return new Nack()
            },
        })
    }
}

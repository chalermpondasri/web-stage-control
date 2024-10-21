import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { EXCHANGES, QUEUES } from '@libs/common/constants/mq-config.constant'
import { ProviderName } from '@libs/common/constants/providerName'
import { EnvironmentConfig } from '@libs/common/models'
import { TrackElasticRepository } from '@libs/repositories/elasticsearch/track.elastic.repository'
import { TrackES } from '@libs/repositories/interfaces/search/track.interface'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConsumeMessage } from 'amqplib'

const rabbitSubscribeConfig = {
    exchange: `${process.env.NODE_ENV}_${EXCHANGES.EVENT_BUS}`,
    routingKey: 'track.updated',
    queue: QUEUES.TRACK_UPDATE,
    queueOptions: {
        durable: true,
        autoDelete: false,
        exclusive: false,
        deadLetterExchange: EXCHANGES.TRACK_DL,
    },
}

@Injectable()
export class TrackUpdateConsumer {
    private readonly _logger = new Logger(TrackUpdateConsumer.name)
    constructor(
        @Inject(ProviderName.ENV_CONFIG)
        private readonly _envConfig: EnvironmentConfig,

        @Inject(ProviderName.TRACK_REPOSITORY)
        private trackRepository: TrackElasticRepository,
    ) {
        this._logger.log(this._envConfig.MESSAGE_BROKER_HOST)
    }
    @RabbitSubscribe(rabbitSubscribeConfig)
    public async pubSubHandler(msg: {}, amqpMsg: ConsumeMessage) {
        if (!msg['payload']) {
            this._logger.error('Invalid message format: no payload')
            this._logger.error('Moving message to dead letter queue: ' + EXCHANGES.TRACK_DL)
            return new Nack()
        }

        if (msg['event'] !== 'track.updated') {
            this._logger.error('Invalid event type: ' + msg['event'])
            this._logger.error('Moving message to dead letter queue: ' + EXCHANGES.TRACK_DL)
            return new Nack()
        }

        const track: TrackES = {} as TrackES
        Object.assign(track, msg['payload'])

        if (!track.publishedAt) {
            this.trackRepository.deleteTrack(track).subscribe({
                next: (value) => {
                    this._logger.log(`Document deleted: ${JSON.stringify(value)}`)
                },
                error: (error) => {
                    this._logger.error(`Error deleting document: ${error}`)
                    // add error message to metadata and move to dead letter queue
                    this._logger.error('Moving message to dead letter queue: ' + EXCHANGES.TRACK_DL)

                    return new Nack()
                },
            })

            return
        }

        this._logger.log(`Received message: ${JSON.stringify(msg, null, 2)}`)

        this.trackRepository.updateTrack(track).subscribe({
            next: (value) => {
                this._logger.log(`Document updated: ${JSON.stringify(value)}`)
            },
            error: (error) => {
                this._logger.error(`Error updating document: ${error}`)
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

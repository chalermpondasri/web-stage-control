import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { EXCHANGES, QUEUES } from '@libs/common/constants/mq-config.constant'
import { ProviderName } from '@libs/common/constants/providerName'
import { EnvironmentConfig } from '@libs/common/models'
import { TrackElasticRepository } from '@libs/repositories/elasticsearch/track.elastic.repository'
import { TrackES } from '@libs/repositories/interfaces/search/track.interface'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConsumeMessage } from 'amqplib'
import { getRabbitSubscribeConfig, handleError, isValidMessage } from 'apps/mq-consumer/src/utils/consumer.util'
import { TrackEsDto } from 'apps/search/src/domains/track/dtos/track.dto'
import { catchError, firstValueFrom } from 'rxjs'

const rabbitSubscribeConfig = getRabbitSubscribeConfig(
    QUEUES.TRACK_CREATE,
    'track.created',
    EXCHANGES.TRACK_DL,
    'track.created.dlq',
)

@Injectable()
export class TrackCreateConsumer {
    private readonly _logger = new Logger(TrackCreateConsumer.name)
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
        if (!isValidMessage(this._logger, msg, EXCHANGES.TRACK_DL)) {
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
                        handleError(this._logger, error, EXCHANGES.TRACK_DL)
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

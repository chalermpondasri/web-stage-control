import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { EXCHANGES, QUEUES } from '@libs/common/constants/mq-config.constant'
import { ProviderName } from '@libs/common/constants/providerName'
import { EnvironmentConfig } from '@libs/common/models'
import { ArtistElasticRepository } from '@libs/repositories/elasticsearch/artist.elastic.repository'
import { ArtistES } from '@libs/repositories/interfaces/search/artist.interface'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConsumeMessage } from 'amqplib'
import { getRabbitSubscribeConfig, handleError, isValidMessage } from 'apps/mq-consumer/src/utils/consumer.util'
import { catchError, firstValueFrom } from 'rxjs'

const rabbitSubscribeConfig = getRabbitSubscribeConfig(
    QUEUES.ARTIST_DELETE,
    'artist.deleted',
    EXCHANGES.ARTIST_DL,
    'artist.deleted.dlq',
)

@Injectable()
export class ArtistDeleteConsumer {
    private readonly _logger = new Logger(ArtistDeleteConsumer.name)
    constructor(
        @Inject(ProviderName.ENV_CONFIG)
        private readonly _envConfig: EnvironmentConfig,

        @Inject(ProviderName.ARTIST_REPOSITORY)
        private artistRepository: ArtistElasticRepository,
    ) {
        this._logger.log(this._envConfig.MESSAGE_BROKER_HOST)
    }

    @RabbitSubscribe(rabbitSubscribeConfig)
    public async pubSubHandler(msg: {}, amqpMsg: ConsumeMessage) {
        if (!isValidMessage(this._logger, msg, EXCHANGES.ARTIST_DL)) {
            return new Nack()
        }

        const artist: ArtistES = {} as ArtistES
        Object.assign(artist, msg['payload'])

        this._logger.log(`Received message: ${JSON.stringify(msg, null, 2)}`)

        try {
            await firstValueFrom(
                this.artistRepository.deleteArtist(artist).pipe(
                    catchError((error) => {
                        handleError(this._logger, error, EXCHANGES.ARTIST_DL)
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

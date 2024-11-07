import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { EXCHANGES, QUEUES } from '@libs/common/constants/mq-config.constant'
import { ProviderName } from '@libs/common/constants/providerName'
import { EnvironmentConfig } from '@libs/common/models'
import { ArtistElasticRepository } from '@libs/repositories/elasticsearch/artist.elastic.repository'
import { ArtistES } from '@libs/repositories/interfaces/search/artist.interface'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConsumeMessage } from 'amqplib'
import { getRabbitSubscribeConfig, handleError, isValidMessage } from 'apps/mq-consumer/src/utils/consumer.util'
import { ArtistEsDto } from 'apps/search/src/domains/artist/dtos/artist.dto'
import { catchError, firstValueFrom } from 'rxjs'

const rabbitSubscribeConfig = getRabbitSubscribeConfig(
    QUEUES.ARTIST_UPDATE,
    'artist.updated',
    EXCHANGES.ARTIST_DL,
    'artist.updated.dlq',
)

@Injectable()
export class ArtistUpdateConsumer {
    private readonly _logger = new Logger(ArtistUpdateConsumer.name)
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

        const artist = ArtistEsDto.toDto(msg['payload'] as ArtistES)

        this._logger.log(`Received message: ${JSON.stringify(msg, null, 2)}`)

        try {
            await firstValueFrom(
                this.artistRepository.updateArtist(artist).pipe(
                    catchError((error) => {
                        handleError(this._logger, error, EXCHANGES.ARTIST_DL)
                        throw error
                    }),
                ),
            )
            this._logger.log(`Document updated successfully`)
        } catch (error) {
            return new Nack()
        }
    }
}

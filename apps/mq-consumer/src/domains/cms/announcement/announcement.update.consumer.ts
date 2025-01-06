import { getRabbitSubscribeConfig } from '../../../utils/consumer.util'
import {
    EXCHANGES,
    ProviderName,
    QUEUES,
} from '@libs/common/constants'
import {
    Inject,
    Injectable,
    Logger,
} from '@nestjs/common'
import {
    Nack,
    RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq'
import { ConsumeMessage } from 'amqplib'
import { EnvironmentConfig } from '@libs/common/models'
import { BroadcastSseService } from '@libs/sse/broadcast.sse'
import { AnnouncementSseDto } from '@libs/common/models/announcement/announcement.dto'

const rabbitSubscribeConfig = getRabbitSubscribeConfig(
    QUEUES.ANNOUNCEMENT_UPDATE,
    'announcement.updated',
    EXCHANGES.ANNOUNCEMENT_DL,
    'announcement.updated.dlq',
)


@Injectable()
export class AnnouncementUpdateConsumer {
    private readonly _logger = new Logger(AnnouncementUpdateConsumer.name)
    public constructor(
        @Inject(ProviderName.ENV_CONFIG)
        private readonly _envConfig: EnvironmentConfig,

        @Inject(ProviderName.BROADCAST_SSE)
        private readonly _broadcastSse: BroadcastSseService

    ) {
    }

    @RabbitSubscribe(rabbitSubscribeConfig)
    public async handler({ payload }: any, message: ConsumeMessage) {
        if(!payload) {
            return new Nack()
        }

        const communities = payload.communities

        const data = AnnouncementSseDto.toDto(payload)
        for (const { communityId } of communities) {
            this._broadcastSse.sendEvent(communityId, {
                type: 'announcement',
                data,
            })
        }


    }
}
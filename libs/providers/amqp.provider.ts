import {
    EXCHANGES,
    ProviderName,
} from '@libs/common/constants'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { EnvironmentConfig } from '@libs/common/models'
import { Publisher } from '@libs/providers/amqp/publisher'

export const amqpPublisherProvider = {
    provide: ProviderName.AMQP_PUBLISHER,
    inject: [
        AmqpConnection,
        ProviderName.ENV_CONFIG,
    ],
    useFactory: (
        connection: AmqpConnection,
        config: EnvironmentConfig,
    ) => {
        const exchangeName = `${config.NODE_ENV}_${EXCHANGES.EVENT_BUS}`
        return new Publisher(connection, exchangeName)
    }
}
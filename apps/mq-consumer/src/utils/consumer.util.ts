import { EXCHANGES, QUEUES } from '@libs/common/constants'
import { Logger } from '@nestjs/common'

export function getRabbitSubscribeConfig(
    queue: QUEUES,
    routingKey: string,
    dlExchange: EXCHANGES,
    dlRoutingKey: string,
) {
    return {
        exchange: `${process.env.NODE_ENV}_${EXCHANGES.EVENT_BUS}`,
        routingKey,
        queue,
        queueOptions: {
            durable: true,
            autoDelete: false,
            exclusive: false,
            deadLetterExchange: dlExchange,
            deadLetterRoutingKey: dlRoutingKey,
        },
    }
}

export function isValidMessage(logger: Logger, msg: {}, dlExchange: EXCHANGES): boolean {
    if (!msg['payload']) {
        handleError(logger, 'Invalid message format: no payload', dlExchange)
        return false
    }

    return true
}

export function handleError(logger: Logger, errorMessage: string, dlExchange: EXCHANGES) {
    logger.error(errorMessage)
    logger.error('Moving message to dead letter queue: ' + dlExchange)
}

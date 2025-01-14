import { IAmqpPublisher } from '@libs/providers/amqp/amqp-publisher.interface'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'

export class Publisher implements IAmqpPublisher{
    public constructor(
        private readonly _amqpConnection: AmqpConnection,
        private readonly _exchangeName: string,
    ) {
    }
    public publish(message: object, routingKey = '#'): Promise<boolean> {
        return this._amqpConnection.publish(this._exchangeName, routingKey, message)
    }
}
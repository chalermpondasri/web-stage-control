export interface IAmqpPublisher {
    publish(message: object, routingKey?: string): Promise<boolean>
}
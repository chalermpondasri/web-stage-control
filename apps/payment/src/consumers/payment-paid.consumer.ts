import {
    Inject,
    Injectable,
    Logger,
} from '@nestjs/common'
import { Repository } from 'typeorm'
import { Payment } from '@libs/entities/payment.entity'
import {
    EXCHANGES,
    ProviderName,
    QUEUES,
} from '@libs/common/constants'
import { getRabbitSubscribeConfig } from '../../../mq-consumer/src/utils/consumer.util'
import {
    Nack,
    RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq'
import {
    from,
    lastValueFrom,
    map,
    mergeMap,
    Observable,
    of,
    tap,
} from 'rxjs'
import Decimal from 'decimal.js'
import { PaymentStatus } from '@libs/common/constants/payment-status.enum'
import { User } from '@libs/entities/user.entity'
import { EventSubjectFactory } from '@libs/providers/event-subject.provider'

export interface PaymentPaidEventPayload {
    id: string
    payeeProxyId: string
    payeeProxyType: string
    payeeAccountNumber: string
    payeeName: string
    payerProxyId: string
    payerProxyType: string
    payerAccountNumber: string
    payerName: string
    sendingBankCode: string
    receivingBankCode: string
    amount: string
    channelCode: string
    transactionId: string
    transactionDateandTime: string // ISO 8601 formatted datetime
    billPaymentRef1: string
    billPaymentRef2: string
    billPaymentRef3: string
    currencyCode: string
    transactionType: string
}

const rabbitSubscribeConfig = getRabbitSubscribeConfig(
    QUEUES.PAYMENT_PAID,
    'payment.paid',
    EXCHANGES.PAYMENT_DL,
    'payment.paid.dlq',
)

@Injectable()
export class PaymentPaidConsumer {
    private readonly _logger = new Logger(PaymentPaidConsumer.name)

    public constructor(
        @Inject(ProviderName.PAYMENT_REPOSITORY)
        private readonly _paymentRepository: Repository<Payment>,
        @Inject(ProviderName.SSE_PAYMENT_SUBJECT)
        private readonly _eventSubjectFactory: EventSubjectFactory,
    ) {
    }

    @RabbitSubscribe(rabbitSubscribeConfig)
    public async handler(data: PaymentPaidEventPayload): Promise<void | Nack> {
        const observable$ = (d: PaymentPaidEventPayload): Observable<any> => of(d).pipe(
            mergeMap(d => {
                return from(this._paymentRepository.findOneByOrFail({
                        ref1: d.billPaymentRef1,
                        ref2: d.billPaymentRef2,
                        ref3: d.billPaymentRef3,
                        total: new Decimal( d.amount)
                    }),
                ).pipe(
                    map(payment => {
                        return { payment, data: d }
                    }),
                )
            }),
            mergeMap(({ payment, data }) => {
                return from(this._paymentRepository.manager.transaction(async em => {
                    payment.paymentStatus = PaymentStatus.PAID
                    await em.save(Payment, payment)
                    await em.increment(User, {id: payment.userId}, 'remainCoins', payment.coinGain )
                })).pipe(
                    map(() => ({ payment, data }))
                )
            }),
            tap(({ payment, data }) => {
                this._eventSubjectFactory.push(payment.transactionId, 'PAYMENT_UPDATE',{
                    transactionId: payment.transactionId,
                    status: payment.paymentStatus,
                    total: payment.total.toNumber(),
                }, {delete: true})
                this._logger.log(`payment txn received and process: ${d.id} (${payment.transactionId})`)
            })
        )

        return lastValueFrom(observable$(data)).catch(err => {
            this._logger.error(err)
            return new Nack()
        })
    }

}
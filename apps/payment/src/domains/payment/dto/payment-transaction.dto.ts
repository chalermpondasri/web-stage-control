import { DateTimeString } from '@libs/common/models'
import { Payment } from '@libs/entities/payment.entity'

export class PaymentTransactionDto {
    public transactionId: string
    public total: number
    public coinGain: number
    public paymentStatus: string
    public updatedAt: DateTimeString
    public paymentType: string
    public coinBonus: number
}
export class PaymentTransaction {
    public static toPaymentTransactionDto(payment: Payment): PaymentTransactionDto {
        return {
            total: payment.total.toNumber(),
            transactionId: payment.transactionId,
            coinGain: payment.coinGain,
            paymentStatus: payment.paymentStatus,
            updatedAt: payment.updatedAt.toISOString(),
            paymentType: 'payment.title.coin_topup',
            coinBonus: payment.coinBonus,
        }
    }
}

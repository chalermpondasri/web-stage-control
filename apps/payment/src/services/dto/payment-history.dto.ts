import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export type PaymentType = 'QR_PAYMENT'
export type TransactionType = 'TOPUP' | 'RETURN'

@Expose()
export class PaymentHistoryDto {

    @ApiProperty()
    public transactionId: string
    @ApiProperty()
    public timestamp: Date
    @ApiProperty()
    public coinGain: number
    @ApiProperty({
        nullable: true,
    })
    public price: number
    @ApiProperty({
        examples: ['QR_PAYMENT']
    })
    public paymentType: PaymentType
    @ApiProperty({
        examples: ['RETURN', 'TOPUP'],

    })
    public transactionType: TransactionType

}
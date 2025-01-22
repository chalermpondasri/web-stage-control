import { PaymentStatus } from '@libs/common/constants/payment-status.enum'
import { ApiProperty } from '@nestjs/swagger'

export class CheckoutPackageResponse {
    @ApiProperty()
    public packageId: number
    @ApiProperty()
    public transactionId: number
    @ApiProperty()
    public expiredAt: Date
    @ApiProperty()
    public total: number
    @ApiProperty()
    public qrData: string
    @ApiProperty()
    public status: PaymentStatus
    @ApiProperty()
    public coinGain: number
    @ApiProperty()
    public coinBonus: number
}

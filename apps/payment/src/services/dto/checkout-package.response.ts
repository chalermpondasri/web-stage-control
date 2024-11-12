import { PaymentStatus } from '@libs/common/constants/payment-status.enum'

export class CheckoutPackageResponse {
    public packageId: number
    public transactionId: number
    public expireAt: Date
    public total: number
    public qrData: string
    public status: PaymentStatus

    public coinGain: number
    public coinBonus: number
}

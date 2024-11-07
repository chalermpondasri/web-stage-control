import { IsNotEmpty, IsNumber } from 'class-validator'

export class CheckoutPackageRequest {
    @IsNotEmpty()
    public transactionToken: string

    @IsNotEmpty()
    @IsNumber()
    public packageId: number
}

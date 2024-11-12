import { IsNotEmpty, IsNumber } from 'class-validator'

export class CheckoutPackageRequest {
    @IsNotEmpty()
    @IsNumber()
    public packageId: number
}

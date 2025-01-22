import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class CheckoutCancelRequest {
    @ApiProperty()
    @IsNotEmpty()
    public transactionId: string
}
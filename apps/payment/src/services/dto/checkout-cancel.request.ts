import { ApiProperty } from '@nestjs/swagger'
import {
    IsNotEmpty,
    IsNumber,
} from 'class-validator'

export class CheckoutCancelRequest {
    @ApiProperty()
    @IsNotEmpty()
    public transactionId: string

    @ApiProperty()
    @IsNotEmpty()
    public packageId: number

    @ApiProperty()
    @IsNumber()
    public total: number

    @ApiProperty()
    @IsNumber()
    public coinGain: number

    @ApiProperty()
    @IsNumber()
    public coinBonus: number

    @ApiProperty()
    @IsNotEmpty()
    public expiredAt: string
}
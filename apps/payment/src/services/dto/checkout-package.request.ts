import {
    IsNotEmpty,
    IsNumber,
    IsPositive,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CheckoutPackageRequest {
    @IsNotEmpty()
    @IsNumber()
    @ApiProperty()
    public packageId: number

    @ApiProperty()
    @IsPositive()
    public price: number

    @ApiProperty()
    @IsPositive()
    public coinGain: number

    @ApiProperty()
    @IsPositive()
    public coinBonus: number
}

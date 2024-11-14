import {
    IsNotEmpty,
    IsNumber,
    IsPositive,
    Min,
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
    @IsNumber()
    @Min(0)
    public coinBonus: number
}

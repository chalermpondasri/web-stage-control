import {
    IsPositive,
    IsUUID,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class BoostRequest {
    @ApiProperty()
    @IsUUID()
    public communityId: string

    @ApiProperty()
    @IsPositive()
    public trackId: number

    @ApiProperty()
    @IsPositive()
    public boostCoin: number
}
import {
    IsOptional,
    IsPositive,
    IsUUID,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class BoostRequest {
    @ApiProperty({deprecated: true, description:'using community id from param instead'})
    @IsUUID()
    @IsOptional()
    public communityId: string

    @ApiProperty()
    @IsPositive()
    public trackId: number

    @ApiProperty()
    @IsPositive()
    public boostCoin: number
}
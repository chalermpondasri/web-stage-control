import { ApiProperty } from '@nestjs/swagger'
import { IsPositive } from 'class-validator'

export class AddToQueueRequest {
    @ApiProperty()
    @IsPositive()
    public trackId: number

    @ApiProperty()
    @IsPositive()
    public boostCoin: number
}
import { ApiProperty } from '@nestjs/swagger'
import {
    IsDateString,
    IsUUID,
    Min,
} from 'class-validator'
import { Transform } from 'class-transformer'

export class ProgressUpdateRequest {
    @ApiProperty()
    @IsUUID()
    public transactionId: string

    @ApiProperty()
    @Min(0)
    public trackProgress: number

    @ApiProperty()
    @IsDateString()
    @Transform(({value}) => new Date(value))
    public timestamp: Date
}

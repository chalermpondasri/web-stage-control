import { ApiProperty } from '@nestjs/swagger'
import {
    IsDate,
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
    @IsDate()
    @ApiProperty()
    @Transform(({value}) => new Date(value))
    public timestamp: Date
}

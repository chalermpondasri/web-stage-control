import {
    IsDate,
    IsNotEmpty,
    IsUUID,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'

export class MediaPlayRequest {
    @IsDate()
    @ApiProperty()
    @Transform(({value}) => new Date(value))
    public timestamp: Date

    @IsUUID()
    @IsNotEmpty()
    @ApiProperty()
    public transactionId: string
}

export class MediaPauseRequest {
    @IsDate()
    @ApiProperty()
    @Transform(({value}) => new Date(value))
    public timestamp: Date
}
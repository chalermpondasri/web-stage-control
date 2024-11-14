import {
    IsDate,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'

export class MediaPlayRequest {
    @IsDate()
    @ApiProperty()
    @Transform(({value}) => new Date(value))
    public timestamp: Date
}

export class MediaPauseRequest {
    @IsDate()
    @ApiProperty()
    @Transform(({value}) => new Date(value))
    public timestamp: Date
}
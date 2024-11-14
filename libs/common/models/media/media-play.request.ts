import { IsDateString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'

export class MediaPlayRequest {
    @IsDateString()
    @ApiProperty()
    @Transform(({value}) => new Date(value))
    public timestamp: Date
}

export class MediaPauseRequest {
    @IsDateString()
    @ApiProperty()
    @Transform(({value}) => new Date(value))
    public timestamp: Date
}
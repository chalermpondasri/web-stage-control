import { ApiProperty } from '@nestjs/swagger'
import { IsDefined } from 'class-validator'

export class StageLoggingRequest {

    @ApiProperty({
        required: true,
        type: String
    })
    @IsDefined()
    public subject: string

    @ApiProperty({
        required: true,
        type: String
    })
    @IsDefined()
    public message: string
}

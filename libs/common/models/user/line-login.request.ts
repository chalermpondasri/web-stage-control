import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class LineLoginRequest {

    @ApiProperty()
    @IsNotEmpty()
    public authorizationCode: string

}
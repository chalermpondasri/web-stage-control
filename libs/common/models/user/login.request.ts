import {
    IsAlphanumeric,
    IsNotEmpty,
    MinLength,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class LoginRequest {

    @ApiProperty()
    @IsNotEmpty()
    @IsAlphanumeric()
    public username: string

    @ApiProperty()
    @MinLength(6)
    public password: string

}
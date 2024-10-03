import {
    IsAlphanumeric,
    IsNotEmpty,
    MinLength,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class LoginRequest {

    @ApiProperty()
    @IsNotEmpty()
    public username: string

    @ApiProperty()
    @IsAlphanumeric()
    @MinLength(6)
    public password: string

}
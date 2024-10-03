import {
    IsAlphanumeric,
    IsNotEmpty,
    Min,
    MinLength,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateUserRequest {

    @ApiProperty()
    @IsNotEmpty()
    @IsAlphanumeric()
    public username: string

    @ApiProperty()
    @IsNotEmpty()
    @MinLength(6)
    public password: string
}
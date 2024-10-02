import {
    IsAlphanumeric,
    IsNotEmpty,
    MinLength,
} from 'class-validator'

export class LoginRequest {
    @IsNotEmpty()
    public username: string

    @IsAlphanumeric()
    @MinLength(6)
    public password: string

}
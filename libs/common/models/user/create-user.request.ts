import {
    IsAlphanumeric,
    IsNotEmpty,
    Min,
    MinLength,
} from 'class-validator'

export class CreateUserRequest {
    @IsNotEmpty()
    @IsAlphanumeric()
    public username: string
    @IsNotEmpty()
    @MinLength(6)
    public password: string
}
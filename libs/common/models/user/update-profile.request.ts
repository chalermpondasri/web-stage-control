import { ApiProperty } from '@nestjs/swagger'
import {
    IsBoolean,
    IsDefined,
    IsEmail,
    IsNumberString,
    IsOptional,
    IsString,
} from 'class-validator'

export class UpdateProfileRequest {

    @IsString()
    @IsDefined()
    @ApiProperty({
        required: true,
        type: String
    })
    public name: string

    @IsNumberString()
    @IsOptional()
    @ApiProperty({
        type: String
    })
    public phoneNumber: string

    @IsEmail()
    @IsOptional()
    @ApiProperty({
        type: String,
        example: 'email@example.com'
    })
    public email: string

    @IsBoolean()
    @IsDefined()
    @ApiProperty({
        required: true,
        type: Boolean
    })
    public enableShowProfileImage: boolean

    @IsBoolean()
    @IsDefined()
    @ApiProperty({
        required: true,
        type: Boolean
    })
    public enableShowProfileName: boolean
}
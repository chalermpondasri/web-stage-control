import {
    IsBoolean,
    IsDefined,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateProfileDarkModeRequest {
    @IsBoolean()
    @IsDefined()
    @ApiProperty({
        required: true,
        type: Boolean
    })
    public isDarkMode: boolean
}
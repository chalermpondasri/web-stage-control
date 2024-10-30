import { IsJWT } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class RefreshTokenRequest {
    @ApiProperty({ description: 'Refresh token' })
    @IsJWT()
    public refreshToken: string
}
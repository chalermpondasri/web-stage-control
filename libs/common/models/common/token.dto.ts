import { Expose } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class TokenDto {
    @Expose()
    @ApiProperty()
    public accessToken: string
    @Expose()
    @ApiProperty()
    public refreshToken: string
}

export class AccessTokenDto {
    @Expose()
    @ApiProperty()
    accessToken: string
}
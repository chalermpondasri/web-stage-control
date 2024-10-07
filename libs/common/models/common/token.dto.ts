import { Expose } from 'class-transformer'

export class TokenDto {
    @Expose()
    public accessToken: string
    @Expose()
    public refreshToken: string
}
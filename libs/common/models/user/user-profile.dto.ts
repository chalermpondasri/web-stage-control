import {
    Expose,
    Transform,
} from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class UserProfileDto {
    @ApiProperty()
    @Expose()
    public id: string

    @ApiProperty()
    @Expose()
    public name: string

    @ApiProperty()
    @Expose()
    public picture: string

    @ApiProperty()
    @Expose()
    public email: string

    @ApiProperty()
    @Expose()
    public phoneNumber: string

    @ApiProperty()
    @Expose()
    public isConsentAccepted: boolean

    @ApiProperty()
    @Expose()
    public totalVouchers: number

    @ApiProperty()
    @Expose()
    @Transform(({obj}) => Number(obj['remainCoins'] ?? 0))
    public totalCoins: number

    @ApiProperty()
    @Expose()
    public setting: {showProfile: boolean, showName: boolean}

    @ApiProperty()
    @Expose()
    public isDarkMode: boolean
}
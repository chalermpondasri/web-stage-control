import { Locale } from '@libs/common/models'
import { Expose } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class QueueTrackDto {
    @ApiProperty()
    @Expose()
    public title: Locale

    @ApiProperty()
    @Expose()
    public artists: string[]

    @ApiProperty()
    @Expose()
    public coverImage: string

    @ApiProperty()
    @Expose()
    public totalCoins: number

}
import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { Locale } from '@libs/common/models'

export class PlaybackPlaySse {

    @ApiProperty()
    @Expose()
    public transactionId: string

    @ApiProperty()
    @Expose()
    public trackId: number

    @ApiProperty({
        type: Locale
    })
    @Expose()
    public title: Locale

    @ApiProperty()
    @Expose()
    public artists: string[]

    @ApiProperty()
    @Expose()
    public artistImage: string

    @ApiProperty()
    @Expose()
    public coverImage: string

    @ApiProperty()
    @Expose()
    public trackDuration: number

    @ApiProperty()
    @Expose()
    public playedAt: Date

    @ApiProperty()
    @Expose()
    public trackProgress: number

    @ApiProperty()
    @Expose()
    public progressUpdatedAt: Date
}
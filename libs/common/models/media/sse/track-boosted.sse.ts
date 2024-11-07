import { Locale } from '@libs/common/models'
import { ApiProperty } from '@nestjs/swagger'

export class TrackBoostedTrack {
    @ApiProperty()
    public trackId: number
    @ApiProperty({type: Locale})
    public title: Locale
    @ApiProperty()
    public artists: string[]
    @ApiProperty()
    public coverImage: string
    @ApiProperty()
    public totalCoins: number
}

export class TrackBoostedSse {
    @ApiProperty()
    public timestamp: string

    @ApiProperty()
    public trackId: number

    @ApiProperty()
    public totalCoins: number

    @ApiProperty()
    public boostedBy: number

    @ApiProperty({type: TrackBoostedTrack})
    public track: TrackBoostedTrack
}

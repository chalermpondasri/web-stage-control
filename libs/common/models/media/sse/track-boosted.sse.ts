import { Locale } from '@libs/common/models'
import { ApiProperty } from '@nestjs/swagger'


export class TrackBoostedAlbum {
    @ApiProperty({type: Locale})
    albumName: Locale
}
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

    @ApiProperty({type: TrackBoostedAlbum})
    public album: TrackBoostedAlbum
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

import { Locale } from '@libs/common/models'
import { Expose } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { AlbumQueueTrackDto } from '@libs/common/models/media/queue-track.dto'

export class PlayingTrackDto {

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

    @ApiProperty({type: AlbumQueueTrackDto})
    public album: AlbumQueueTrackDto
}
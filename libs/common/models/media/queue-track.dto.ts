import { Locale } from '@libs/common/models'
import { Expose } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'


export class AlbumQueueTrackDto {
    @ApiProperty()
    @Expose()
    public albumId: number
    @ApiProperty({type: Locale})
    @Expose()
    public albumName: Locale
    @ApiProperty()
    @Expose()
    public albumImageUrl: string
}

export class QueueTrackDto {
    @ApiProperty()
    @Expose()
    public trackId: number

    @ApiProperty(
        {type: Locale}
    )
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

    @ApiProperty({type: AlbumQueueTrackDto})
    public album: AlbumQueueTrackDto

}
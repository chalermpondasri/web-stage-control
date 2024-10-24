import { AlbumES } from '@libs/repositories/interfaces/search/album.interface'
import { MediaES } from '@libs/repositories/interfaces/search/media.interface'
import { ApiProperty } from '@nestjs/swagger'
import { Expose, plainToInstance } from 'class-transformer'

type AlbumType = 'album'

export class AlbumDto implements AlbumES {
    @Expose()
    @ApiProperty()
    id: number

    @Expose()
    @ApiProperty()
    createdAt: Date

    @Expose()
    @ApiProperty()
    updatedAt: Date

    @Expose()
    @ApiProperty()
    publishedAt?: Date

    @Expose()
    @ApiProperty()
    title: string

    @Expose()
    @ApiProperty()
    releaseDate?: Date

    @Expose()
    @ApiProperty()
    coverImage?: MediaES

    @Expose()
    @ApiProperty()
    locale: string

    @Expose()
    @ApiProperty({
        enum: [
            'album',
        ],
    })
    type: AlbumType

    public static toDto(album: AlbumES): AlbumDto {
        return plainToInstance(AlbumDto, {
            ...album,
            type: 'album',
        })
    }
}

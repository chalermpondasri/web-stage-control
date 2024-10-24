import { ArtistES } from '@libs/repositories/interfaces/search/artist.interface'
import { MediaES } from '@libs/repositories/interfaces/search/media.interface'
import { ApiProperty } from '@nestjs/swagger'
import { Expose, plainToInstance } from 'class-transformer'

type ArtistType = 'artist'

export class ArtistDto implements ArtistES {
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
    name: string

    @Expose()
    @ApiProperty()
    bio?: string

    @Expose()
    @ApiProperty()
    image?: MediaES

    @Expose()
    @ApiProperty()
    locale: string

    @Expose()
    @ApiProperty({
        enum: [
            'artist',
        ],
    })
    type: ArtistType

    public static toDto(artist: ArtistES): ArtistDto {
        return plainToInstance(ArtistDto, {
            ...artist,
            type: 'artist',
        })
    }
}

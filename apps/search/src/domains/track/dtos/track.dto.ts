import { AlbumES } from '@libs/repositories/interfaces/search/album.interface'
import { ArtistES } from '@libs/repositories/interfaces/search/artist.interface'
import { GenreES } from '@libs/repositories/interfaces/search/genre.interface'
import { MediaES } from '@libs/repositories/interfaces/search/media.interface'
import { PlaylistES } from '@libs/repositories/interfaces/search/playlist.interface'
import { TrackES } from '@libs/repositories/interfaces/search/track.interface'
import { ApiProperty } from '@nestjs/swagger'
import { Expose, plainToInstance, Transform } from 'class-transformer'
import { IsDefined, IsNumber, IsString, MaxLength, Min, MinLength } from 'class-validator'
import { MediaDto } from './media.dto'

type trackType = 'track'
export class TrackDto implements TrackES {
    @Expose()
    @ApiProperty()
    public id: number

    @Expose()
    @ApiProperty()
    public publishedAt?: Date

    @Expose()
    @ApiProperty()
    public title_th: string

    @Expose()
    @ApiProperty()
    public title_en: string

    @Expose()
    @ApiProperty()
    public aliases: string[]

    @Expose()
    @ApiProperty()
    public duration?: number

    @Expose()
    @ApiProperty()
    public audioFile: MediaES

    @Expose()
    @ApiProperty()
    public album?: AlbumES

    @Expose()
    @ApiProperty()
    public artist?: ArtistES

    @Expose()
    @ApiProperty()
    public genres: GenreES[]

    @Expose()
    @ApiProperty()
    public playlists?: PlaylistES[]

    @Expose()
    @ApiProperty({
        type: MediaDto,
    })
    public coverImage?: MediaES

    @Expose()
    @ApiProperty()
    public locale?: string

    @Expose()
    @ApiProperty()
    public createdAt: Date

    @Expose()
    @ApiProperty()
    public updatedAt: Date

    @Expose()
    @ApiProperty({
        enum: [
            'track',
        ],
    })
    public type: trackType

    public static toDto(track: TrackES): TrackDto {
        return plainToInstance(TrackDto, {
            ...track,
            type: 'track',
        })
    }
}

export class SearchTracksRequest {
    @IsDefined()
    @IsString()
    @MinLength(1)
    @MaxLength(128)
    @ApiProperty({
        description: 'Keyword to search',
        example: 'โกหก',
    })
    keyword: string

    @IsDefined()
    @IsNumber()
    @Min(1)
    @Transform(({ value }) => parseInt(value, 10))
    @ApiProperty({
        description: 'Page number',
        example: 1,
        default: 1,
    })
    page: number

    @IsDefined()
    @IsNumber()
    @Min(1)
    @Transform(({ value }) => parseInt(value, 10))
    @ApiProperty({
        description: 'Limit number',
        example: 20,
        default: 20,
    })
    limit: number
}

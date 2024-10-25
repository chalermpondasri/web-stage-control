import { AlbumES } from '@libs/repositories/interfaces/search/album.interface'
import { ArtistES } from '@libs/repositories/interfaces/search/artist.interface'
import { GenreES } from '@libs/repositories/interfaces/search/genre.interface'
import { MediaES } from '@libs/repositories/interfaces/search/media.interface'
import { PlaylistES } from '@libs/repositories/interfaces/search/playlist.interface'
import { TrackES } from '@libs/repositories/interfaces/search/track.interface'
import { ApiProperty, PickType } from '@nestjs/swagger'
import { Expose, plainToInstance, Transform } from 'class-transformer'
import { IsDefined, IsNumber, IsString, MaxLength, Min, MinLength } from 'class-validator'
import { ArtistSearchDto } from '../../artist/dtos/artist.dto'
import { AlbumSearchDto } from './album.dto'
import { MediaDto, MediaSearchDto } from './media.dto'

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
    public image?: MediaES

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

export class TrackSearchDto extends PickType(TrackDto, [
    'id',
    'type',
]) {
    @Expose()
    @ApiProperty()
    public title: string

    @Expose()
    @ApiProperty()
    @Transform(({ value }) => plainToInstance(MediaSearchDto, value, { excludeExtraneousValues: true }))
    public image: MediaSearchDto

    @Expose()
    @ApiProperty()
    @Transform(({ value }) => plainToInstance(ArtistSearchDto, value, { excludeExtraneousValues: true }))
    public artist: ArtistSearchDto

    @Expose()
    @ApiProperty()
    @Transform(({ value }) => plainToInstance(AlbumSearchDto, value, { excludeExtraneousValues: true }))
    public album: AlbumSearchDto

    public static toDto(track: TrackES): TrackSearchDto {
        return plainToInstance(
            TrackSearchDto,
            {
                ...track,
                type: 'track',
            },
            {
                excludeExtraneousValues: true,
            },
        )
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

import { MediaES } from '@libs/repositories/interfaces/search/media.interface'
import { TrackES } from '@libs/repositories/interfaces/search/track.interface'
import { ApiProperty, OmitType, PickType } from '@nestjs/swagger'
import { Expose, plainToInstance, Transform } from 'class-transformer'
import { IsDefined, IsNumber, IsString, MaxLength, Min, MinLength } from 'class-validator'
import { AlbumDto, AlbumSearchDto } from '../../album/dtos/album.dto'
import { ArtistDto, ArtistSearchDto } from '../../artist/dtos/artist.dto'
import { MediaDto, MediaSearchDto } from './media.dto'

type trackType = 'track'
export class TrackDto implements TrackES {
    @Expose()
    @ApiProperty()
    public id: number

    @Expose()
    @ApiProperty()
    public name_th: string

    @Expose()
    @ApiProperty()
    public name_en: string

    @Expose()
    @ApiProperty()
    public description: string

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
    public mvFile: MediaES

    @Expose()
    @ApiProperty()
    public album_id: number

    @Expose()
    @ApiProperty()
    @Transform(({ value }) => plainToInstance(AlbumDto, value, { excludeExtraneousValues: true }))
    public album: AlbumDto

    @Expose()
    @ApiProperty()
    public artist_ids: number[]

    @Expose()
    @ApiProperty()
    @Transform(({ value }) =>
        value.map((artist) => plainToInstance(ArtistDto, artist, { excludeExtraneousValues: true })),
    )
    public artists: ArtistDto[]

    @Expose()
    @ApiProperty()
    public genres: string[]

    @Expose()
    @ApiProperty()
    public playlist_ids: number[]

    @Expose()
    @ApiProperty({
        type: MediaDto,
    })
    public image?: MediaES

    @Expose()
    @ApiProperty()
    public hitCounts: number

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
    @ApiProperty()
    public publishedAt?: Date

    @Expose()
    @ApiProperty()
    public releaseDate?: Date

    @Expose()
    @ApiProperty({
        enum: [
            'track',
        ],
    })
    public type: trackType

    public static toDto(track: TrackES): TrackDto {
        return plainToInstance(
            TrackDto,
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

export class TrackSearchDto extends PickType(TrackDto, [
    'id',
    'type',
    'releaseDate',
    'genres',
    'hitCounts',
]) {
    @Expose()
    @ApiProperty()
    public name: string

    @Expose()
    @ApiProperty()
    @Transform(({ value }) => plainToInstance(MediaSearchDto, value, { excludeExtraneousValues: true }))
    public image: MediaSearchDto

    @Expose()
    @ApiProperty()
    @Transform(({ value }) => value && value.map((artist) => ArtistSearchDto.toDto(artist, { type: 'artist' })))
    public artists: ArtistSearchDto[]

    @Expose()
    @ApiProperty()
    @Transform(({ value }) => value && AlbumSearchDto.toDto(value, { type: 'album' }))
    public album: AlbumSearchDto[]

    @Expose()
    @ApiProperty()
    public duration: number

    @Expose()
    @ApiProperty()
    @Transform(({ value }) => plainToInstance(MediaSearchDto, value, { excludeExtraneousValues: true }))
    public audioFile: MediaSearchDto

    @Expose()
    @ApiProperty()
    @Transform(({ value }) => plainToInstance(MediaSearchDto, value, { excludeExtraneousValues: true }))
    public mvFile: MediaSearchDto

    public static toDto(track: TrackES, params?): TrackSearchDto {
        return plainToInstance(
            TrackSearchDto,
            {
                ...track,
                ...params,
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

export class TrackEsDto extends OmitType(TrackDto, [
    'artists',
    'album',
    'createdAt',
    'updatedAt',
]) {
    public static toDto(track: TrackES): TrackEsDto {
        return plainToInstance(
            TrackEsDto,
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

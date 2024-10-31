import { ArtistES } from '@libs/repositories/interfaces/search/artist.interface'
import { MediaES } from '@libs/repositories/interfaces/search/media.interface'
import { ApiProperty, OmitType, PickType } from '@nestjs/swagger'
import { Exclude, Expose, plainToInstance, Transform } from 'class-transformer'
import { AlbumDto, AlbumSearchDto } from '../../album/dtos/album.dto'
import { MediaSearchDto } from '../../track/dtos/media.dto'
import { TrackDto, TrackSearchDto } from '../../track/dtos/track.dto'

type ArtistType = 'artist'

export class ArtistDto implements ArtistES {
    @Expose()
    @ApiProperty()
    id: number

    @Expose()
    @ApiProperty()
    name_th: string

    @Expose()
    @ApiProperty()
    name_en: string

    @Expose()
    @ApiProperty()
    description?: string

    @Expose()
    @ApiProperty()
    aliases?: string[]

    @Expose()
    @ApiProperty()
    image?: MediaES

    @Expose()
    @ApiProperty()
    coverImage?: MediaES

    @Expose()
    @ApiProperty()
    album_ids: number[]

    @Expose()
    @ApiProperty()
    @Transform(({ value }) => plainToInstance(AlbumDto, value, { excludeExtraneousValues: true }))
    public albums: AlbumDto[]

    @Expose()
    @ApiProperty()
    track_ids: number[]

    @Expose()
    @ApiProperty()
    @Transform(({ value }) => plainToInstance(TrackDto, value, { excludeExtraneousValues: true }))
    public tracks: TrackDto[]

    @Expose()
    @ApiProperty()
    playlist_ids: number[]

    @Expose()
    @ApiProperty()
    locale: string

    @Exclude()
    @ApiProperty()
    createdAt: Date

    @Exclude()
    @ApiProperty()
    updatedAt: Date

    @Expose()
    @ApiProperty()
    publishedAt?: Date

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

export class ArtistSearchDto extends PickType(ArtistDto, [
    'id',
    'type',
]) {
    @Expose()
    @ApiProperty()
    public name: string

    @Expose()
    @ApiProperty()
    @Transform(({ value }) => plainToInstance(MediaSearchDto, value, { excludeExtraneousValues: true }))
    public image?: MediaSearchDto

    @Expose()
    @ApiProperty()
    @Transform(({ value }) => plainToInstance(MediaSearchDto, value, { excludeExtraneousValues: true }))
    public coverImage?: MediaSearchDto

    @Expose()
    @ApiProperty()
    @Transform(({ value }) => value && value.map((artist) => TrackSearchDto.toDto(artist, { type: 'artist' })))
    public tracks: TrackSearchDto[]

    @Expose()
    @ApiProperty()
    @Transform(({ value }) => value && value.map((album) => AlbumSearchDto.toDto(album, { type: 'artist' })))
    public albums: AlbumSearchDto[]

    public static toDto(artist: ArtistES, params?): ArtistSearchDto {
        const name = artist.name_th || artist.name_en
        return plainToInstance(
            ArtistSearchDto,
            {
                ...artist,
                ...params,
                type: 'artist',
                name,
            },
            {
                excludeExtraneousValues: true,
            },
        )
    }
}

export class ArtistEsDto extends OmitType(ArtistDto, [
    'albums',
    'tracks',
]) {
    public static toDto(artist: ArtistES): ArtistEsDto {
        return plainToInstance(
            ArtistEsDto,
            {
                ...artist,
                type: 'artist',
            },
            {
                excludeExtraneousValues: true,
            },
        )
    }
}

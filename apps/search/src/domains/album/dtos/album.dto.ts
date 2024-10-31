import { AlbumES } from '@libs/repositories/interfaces/search/album.interface'
import { MediaES } from '@libs/repositories/interfaces/search/media.interface'
import { ApiProperty, OmitType, PickType } from '@nestjs/swagger'
import { Expose, plainToInstance, Transform } from 'class-transformer'
import { ArtistDto, ArtistSearchDto } from '../../artist/dtos/artist.dto'
import { MediaSearchDto } from '../../track/dtos/media.dto'
import { TrackDto, TrackSearchDto } from '../../track/dtos/track.dto'

type AlbumType = 'album'

export class AlbumDto implements AlbumES {
    @Expose()
    @ApiProperty()
    id: number

    @Expose()
    @ApiProperty()
    publishedAt?: Date

    @Expose()
    @ApiProperty()
    name_th: string

    @Expose()
    @ApiProperty()
    name_en: string

    @Expose()
    @ApiProperty()
    releaseDate?: Date

    @Expose()
    @ApiProperty()
    public artist_ids: number[]

    @Expose()
    @ApiProperty()
    @Transform(({ value }) => plainToInstance(ArtistDto, value, { excludeExtraneousValues: true }))
    public artists: ArtistDto[]

    @Expose()
    @ApiProperty()
    public track_ids: number[]

    @Expose()
    @ApiProperty()
    @Transform(({ value }) => plainToInstance(TrackDto, value, { excludeExtraneousValues: true }))
    public tracks: TrackDto[]

    @Expose()
    @ApiProperty()
    image?: MediaES

    @Expose()
    @ApiProperty()
    locale: string

    @Expose()
    @ApiProperty()
    createdAt: Date

    @Expose()
    @ApiProperty()
    updatedAt: Date

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

export class AlbumSearchDto extends PickType(AlbumDto, [
    'id',
    'releaseDate',
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
    @Transform(({ value }) => value && value.map((track) => TrackSearchDto.toDto(track, { type: 'track' })))
    public tracks: TrackSearchDto[]

    @Expose()
    @ApiProperty()
    @Transform(({ value }) => value && value.map((artist) => ArtistSearchDto.toDto(artist, { type: 'artist' })))
    public artists: ArtistSearchDto[]

    public static toDto(album: AlbumES, params?): AlbumSearchDto {
        const name = album.name_th || album.name_en

        return plainToInstance(
            AlbumSearchDto,
            {
                ...album,
                ...params,
                type: 'album',
                name,
            },
            {
                excludeExtraneousValues: true,
            },
        )
    }
}

export class AlbumEsDto extends OmitType(AlbumDto, [
    'artists',
    'tracks',
    'createdAt',
    'updatedAt',
]) {
    public static toDto(album: AlbumES): AlbumEsDto {
        return plainToInstance(
            AlbumEsDto,
            {
                ...album,
                type: 'album',
            },
            {
                excludeExtraneousValues: true,
            },
        )
    }
}

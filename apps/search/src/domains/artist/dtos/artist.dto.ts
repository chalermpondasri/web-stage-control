import { ArtistES } from '@libs/repositories/interfaces/search/artist.interface'
import { MediaES } from '@libs/repositories/interfaces/search/media.interface'
import { ApiProperty, PickType } from '@nestjs/swagger'
import { Exclude, Expose, plainToInstance, Transform } from 'class-transformer'
import { MediaSearchDto } from '../../track/dtos/media.dto'

type ArtistType = 'artist'

export class ArtistDto implements ArtistES {
    @Expose()
    @ApiProperty()
    id: number

    @Exclude()
    @ApiProperty()
    createdAt: Date

    @Exclude()
    @ApiProperty()
    updatedAt: Date

    @Exclude()
    @ApiProperty()
    publishedAt?: Date

    @Expose()
    @ApiProperty()
    name: string

    @Exclude()
    @ApiProperty()
    bio?: string

    @Expose()
    @ApiProperty()
    image?: MediaES

    @Expose()
    @ApiProperty()
    coverImage?: MediaES

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

export class ArtistSearchDto extends PickType(ArtistDto, [
    'id',
    'name',
    'type',
]) {
    @Expose()
    @ApiProperty()
    @Transform(({ value }) => plainToInstance(MediaSearchDto, value, { excludeExtraneousValues: true }))
    public image?: MediaSearchDto

    @Expose()
    @ApiProperty()
    @Transform(({ value }) => plainToInstance(MediaSearchDto, value, { excludeExtraneousValues: true }))
    public coverImage?: MediaSearchDto

    public static toDto(artist: ArtistES): ArtistSearchDto {
        return plainToInstance(
            ArtistSearchDto,
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

import { AlbumES } from '@libs/repositories/interfaces/search/album.interface'
import { MediaES } from '@libs/repositories/interfaces/search/media.interface'
import { ApiProperty, PickType } from '@nestjs/swagger'
import { Expose, plainToInstance, Transform } from 'class-transformer'
import { MediaSearchDto } from './media.dto'

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
    image?: MediaES

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

export class AlbumSearchDto extends PickType(AlbumDto, [
    'id',
    'title',
    'releaseDate',
    'type',
]) {
    @Expose()
    @ApiProperty()
    @Transform(({ value }) => plainToInstance(MediaSearchDto, value, { excludeExtraneousValues: true }))
    public image?: MediaSearchDto

    public static toDto(album: AlbumES): AlbumSearchDto {
        return plainToInstance(
            AlbumSearchDto,
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

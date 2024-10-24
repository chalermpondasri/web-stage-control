import { MediaES, MediaFormat } from '@libs/repositories/interfaces/search/media.interface'
import { ApiProperty, PickType } from '@nestjs/swagger'
import { Expose, Type, plainToInstance } from 'class-transformer'

export class MediaFormatDto implements MediaFormat {
    @Expose()
    @ApiProperty({ description: 'Name of the media format', example: 'thumbnail' })
    name: string

    @Expose()
    @ApiProperty({ description: 'Hash of the media format', example: 'abc123' })
    hash: string

    @Expose()
    @ApiProperty({ description: 'File extension of the media format', example: '.jpg' })
    ext: string

    @Expose()
    @ApiProperty({ description: 'MIME type of the media format', example: 'image/jpeg' })
    mime: string

    @Expose()
    @ApiProperty({ description: 'Width of the media format in pixels', example: 150 })
    width: number

    @Expose()
    @ApiProperty({ description: 'Height of the media format in pixels', example: 150 })
    height: number

    @Expose()
    @ApiProperty({ description: 'Size of the media format in bytes', example: 1024 })
    size: number

    @Expose()
    @ApiProperty({ description: 'Path to the media format', example: '/uploads/thumbnail.jpg' })
    path: string

    @Expose()
    @ApiProperty({ description: 'URL to access the media format', example: 'http://example.com/uploads/thumbnail.jpg' })
    url: string
}

export class MediaDto implements MediaES {
    @Expose()
    @ApiProperty({ description: 'ID of the media', example: 1 })
    id: number

    @Expose()
    @ApiProperty({ description: 'Name of the media', example: 'example.jpg' })
    name: string

    @Expose()
    @ApiProperty({ description: 'Alternative text for the media', example: 'An example image' })
    alternativeText: string

    @Expose()
    @ApiProperty({ description: 'Caption for the media', example: 'This is an example image' })
    caption: string

    @Expose()
    @ApiProperty({ description: 'Width of the media in pixels', example: 800 })
    width: number

    @Expose()
    @ApiProperty({ description: 'Height of the media in pixels', example: 600 })
    height: number

    @Expose()
    @Type(() => MediaFormatDto)
    @ApiProperty({
        description: 'Formats of the media',
        type: () => MediaFormatDto,
        example: {
            thumbnail: {
                name: 'thumbnail',
                hash: 'abc123',
                ext: '.jpg',
                mime: 'image/jpeg',
                width: 150,
                height: 150,
                size: 1024,
                path: '/uploads/thumbnail.jpg',
                url: 'http://example.com/uploads/thumbnail.jpg',
            },
            small: {
                name: 'small',
                hash: 'def456',
                ext: '.jpg',
                mime: 'image/jpeg',
                width: 300,
                height: 300,
                size: 2048,
                path: '/uploads/small.jpg',
                url: 'http://example.com/uploads/small.jpg',
            },
            medium: {
                name: 'medium',
                hash: 'ghi789',
                ext: '.jpg',
                mime: 'image/jpeg',
                width: 600,
                height: 600,
                size: 4096,
                path: '/uploads/medium.jpg',
                url: 'http://example.com/uploads/medium.jpg',
            },
            large: {
                name: 'large',
                hash: 'jkl012',
                ext: '.jpg',
                mime: 'image/jpeg',
                width: 1200,
                height: 1200,
                size: 8192,
                path: '/uploads/large.jpg',
                url: 'http://example.com/uploads/large.jpg',
            },
        },
    })
    formats: {
        thumbnail: MediaFormatDto
        small: MediaFormatDto
        medium: MediaFormatDto
        large: MediaFormatDto
    }

    @Expose()
    @ApiProperty({ description: 'Hash of the media', example: 'abc123' })
    hash: string

    @Expose()
    @ApiProperty({ description: 'File extension of the media', example: '.jpg' })
    ext: string

    @Expose()
    @ApiProperty({ description: 'MIME type of the media', example: 'image/jpeg' })
    mime: string

    @Expose()
    @ApiProperty({ description: 'Size of the media in bytes', example: 10240 })
    size: number

    @Expose()
    @ApiProperty({ description: 'URL to access the media', example: 'http://example.com/uploads/example.jpg' })
    url: string

    @Expose()
    @ApiProperty({ description: 'Preview URL of the media', example: 'http://example.com/uploads/preview_example.jpg' })
    previewUrl: string

    @Expose()
    @ApiProperty({ description: 'Provider of the media', example: 'local' })
    provider: string

    @Expose()
    @ApiProperty({ description: 'Creation date of the media', example: '2023-01-01T00:00:00.000Z' })
    createdAt: Date

    @Expose()
    @ApiProperty({ description: 'Last update date of the media', example: '2023-01-02T00:00:00.000Z' })
    updatedAt: Date

    public static toDto(media: MediaES): MediaDto {
        return plainToInstance(MediaDto, media)
    }
}

export class MediaSearchDto extends PickType(MediaDto, [
    'id',
    'width',
    'height',
    'url',
]) {}

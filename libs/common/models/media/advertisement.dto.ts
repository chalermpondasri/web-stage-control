import {
    CommunityIdDto,
    MediaDto,
} from '@libs/common/models/media/backdrop.dto'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class AdvertisementDto {
    @ApiProperty()
    public id: number
    @ApiProperty()
    public type: string
    @ApiProperty()
    public name: string
    @ApiProperty()
    public start: string
    @ApiProperty()
    public endTime: string
    @ApiProperty()
    public duration: number
    @ApiProperty()
    public createdAt: string
    @ApiProperty()
    public updatedAt: string
    @ApiProperty()
    public publishedAt: string
    @ApiProperty({type: [CommunityIdDto]})
    @Type(() => CommunityIdDto)
    public communities: CommunityIdDto[]

    @ApiProperty({type: MediaDto})
    @Type(() => MediaDto)
    public media: MediaDto
}

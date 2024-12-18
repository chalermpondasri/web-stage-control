import { CommunityDto } from '@libs/common/models/community/community.dto'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class AnnouncementDto {
    @ApiProperty()
    id: number
    @ApiProperty()
    name: string
    @ApiProperty()
    startTime: string
    @ApiProperty()
    endTime: string
    @ApiProperty()
    message: string
    @ApiProperty()
    createdAt: string
    @ApiProperty()
    updatedAt: string
    @ApiProperty()
    publishedAt: string
    @ApiProperty()
    startDate: string
    @ApiProperty()
    endDate: string
    @ApiProperty()
    @Type(() => CommunityDto)
    communities: CommunityDto[]
}

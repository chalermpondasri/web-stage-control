import { CommunityDto } from '@libs/common/models/community/community.dto'
import {
    ApiProperty,
    OmitType,
} from '@nestjs/swagger'
import {
    Expose,
    plainToInstance,
    Type,
} from 'class-transformer'

export class AnnouncementDto {
    @ApiProperty()
    @Expose()
    id: number
    @ApiProperty()
    @Expose()
    name: string
    @ApiProperty()
    @Expose()
    startTime: string
    @ApiProperty()
    @Expose()
    endTime: string
    @ApiProperty()
    @Expose()
    message: string
    @ApiProperty()
    @Expose()
    createdAt: string
    @ApiProperty()
    @Expose()
    updatedAt: string
    @ApiProperty()
    @Expose()
    publishedAt: string
    @ApiProperty()
    @Expose()
    startDate: string
    @ApiProperty()
    @Expose()
    endDate: string
    @ApiProperty()
    @Expose()
    @Type(() => CommunityDto)
    communities: CommunityDto[]
}

export class AnnouncementSseDto extends OmitType(AnnouncementDto, [
    'communities'
]) {

    public static toDto(data: AnnouncementDto): AnnouncementSseDto {
        return plainToInstance(AnnouncementSseDto,
            { ...data },
            {
                excludeExtraneousValues: true,
            },
        )
    }

}



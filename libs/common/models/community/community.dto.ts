import { Expose } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class CommunityDto {
    @Expose()
    @ApiProperty()
    public id: string
    @ApiProperty()
    @Expose()
    public name: string
    @ApiProperty()
    @Expose()
    public startDate: Date
    @ApiProperty()
    @Expose()
    public endDate: Date
    @ApiProperty()
    @Expose()
    public coverImage: string
    @ApiProperty()
    @Expose()
    public isFinished: boolean
}
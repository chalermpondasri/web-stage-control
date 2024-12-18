import {
    ApiProperty,
} from '@nestjs/swagger'

export class MediaDto {
    @ApiProperty()
    public id: number
    @ApiProperty()
    public name: string
    @ApiProperty()
    public alternativeText: any
    @ApiProperty()
    public caption: any
    @ApiProperty()
    public width: number
    @ApiProperty()
    public height: number
    @ApiProperty()
    public formats: any
    @ApiProperty()
    public hash: string
    @ApiProperty()
    public ext: string
    @ApiProperty()
    public mime: string
    @ApiProperty()
    public size: number
    @ApiProperty()
    public url: string
    @ApiProperty()
    public previewUrl: any
    @ApiProperty()
    public provider: string
    @ApiProperty()
    public placeholder: string
}

export class CommunityIdDto {
    @ApiProperty()
    id: number
    @ApiProperty()
    communityId: string
}

export class BackdropDto {
    @ApiProperty()
    public id: number
    @ApiProperty()
    public name: string
    @ApiProperty()
    public type: string
    @ApiProperty()
    public duration: number
    @ApiProperty()
    public startTime: string
    @ApiProperty()
    public endTime: any
    @ApiProperty()
    public createdAt: string
    @ApiProperty()
    public updatedAt: string
    @ApiProperty()
    public publishedAt: string
    @ApiProperty({type: [CommunityIdDto]})
    public communities: CommunityIdDto[]
    @ApiProperty()
    public media: MediaDto

}
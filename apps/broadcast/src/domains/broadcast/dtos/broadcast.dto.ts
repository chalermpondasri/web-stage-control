import { PaginationQuery } from '@libs/common/models'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsDefined, IsNumber, IsString, MaxLength, Min } from 'class-validator'

export class GetStickerRequest extends PaginationQuery {}

export class CreateBroadcastMessageRequest {
    @ApiProperty({
        example: 'Hello World',
        description: 'The message to be broadcasted',
    })
    @IsString()
    @MaxLength(100)
    @IsDefined()
    public message: string

    @ApiProperty({
        example: 1,
        description: 'The sticker id to be broadcasted',
    })
    @IsDefined()
    @IsNumber()
    @Min(0)
    public stickerId: number

    @IsBoolean()
    @ApiProperty({
        example: 'true',
        description: 'The profile image to be broadcasted',
        default: 'true',
    })
    public isShowProfileImage: boolean

    @IsBoolean()
    @ApiProperty({
        example: 'false',
        description: 'The profile name to be broadcasted',
        default: 'false',
    })
    public isShowProfileName: boolean
}

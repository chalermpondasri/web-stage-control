import {
    IsNotEmpty,
    IsString,
    IsUUID,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class StageRegisterRequest {

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    public authorizationCode: string

    @IsUUID()
    @ApiProperty()
    public communityId: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    public location: string

}

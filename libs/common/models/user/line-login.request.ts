import { ApiProperty } from '@nestjs/swagger'
import {
    IsEnum,
    IsNotEmpty,
} from 'class-validator'

export enum AuthenticationType {
    AUTHORIZATION_CODE = 'AUTHORIZATION_CODE',
    ACCESS_TOKEN = 'ACCESS_TOKEN',
}

export class LineLoginRequest {

    @ApiProperty({
        description: 'authentication client type',
        default: AuthenticationType.AUTHORIZATION_CODE,
        enum: AuthenticationType
    })
    @IsEnum(AuthenticationType)
    public type: AuthenticationType = AuthenticationType.AUTHORIZATION_CODE

    @ApiProperty()
    @IsNotEmpty()
    public authorizationCode: string

}
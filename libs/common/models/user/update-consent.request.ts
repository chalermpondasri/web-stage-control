import { ApiProperty } from '@nestjs/swagger'
import {
    IsBase64,
    IsBoolean,
    IsNotEmpty,
} from 'class-validator'

export class UpdateConsentRequest {

    @ApiProperty({
        description: 'Line Authorization Code'
    })
    @IsNotEmpty()
    public authorizationCode: string

    @ApiProperty({
        description: 'indicate whether user accept or reject consent'
    })
    @IsBoolean()
    public consentAccepted: boolean;

    @ApiProperty({
        description: 'consent body encrypted with base64 method'
    })
    @IsBase64()
    public consent: string
}
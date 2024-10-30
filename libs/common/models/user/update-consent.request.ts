import { ApiProperty } from '@nestjs/swagger'
import {
    IsBase64,
    IsBoolean,
} from 'class-validator'

export class UpdateConsentRequest {

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
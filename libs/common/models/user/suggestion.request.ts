import {
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class SuggestionRequest {
    @ApiProperty({description: 'Full suggestion text'})
    @IsNotEmpty()
    public text: string


    @ApiProperty({description: 'Additional note'})
    @IsOptional()
    @IsString()
    public additionalNote: string


}
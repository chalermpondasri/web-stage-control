import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class SuccessDto {
    @ApiProperty()
    @Expose()
    public success: boolean
}
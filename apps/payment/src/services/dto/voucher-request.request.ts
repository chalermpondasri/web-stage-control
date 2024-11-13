import { PaginationQuery } from '@libs/common/models'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class GetVoucherRequest extends PaginationQuery {
    @ApiProperty({
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    public campaignId: number
}

export class ApplyVoucherRequest {
    @ApiProperty()
    @IsString()
    public code: string
}

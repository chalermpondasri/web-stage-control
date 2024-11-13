import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, IsNumber, IsOptional, Min } from 'class-validator'

export class Pagination {
    @IsOptional()
    @IsNumber()
    @Min(1)
    @ApiProperty({
        description: 'Limit of items per page',
        default: 20,
        type: Number,
    })
    @IsInt()
    @Type(() => Number)
    public limit = 20

    @IsOptional()
    @Min(1)
    @ApiProperty({
        description: 'Page number',
        default: 1,
        type: Number,
    })
    @IsInt()
    @Type(() => Number)
    public page = 1

    public toSkip(): number {
        return this.page * this.limit - this.limit
    }

    public toTake(): number {
        return this.limit
    }
}

export class PaginationQuery extends Pagination {
    @IsOptional()
    @ApiProperty({
        description: 'Query to search',
        example: 'Hello World',
    })
    public query: string
}

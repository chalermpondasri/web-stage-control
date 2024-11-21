import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class ListResponse<T> {
    @Expose()
    @ApiProperty({
        type: Number,
    })
    public total = 0

    @Expose()
    @ApiProperty({
        type: Number,
    })
    public limit = 0

    @Expose()
    @ApiProperty({type: Number, default: 1})
    public page = 1

    @Expose()
    @ApiProperty({type: Array})
    public data: T[] = []
}

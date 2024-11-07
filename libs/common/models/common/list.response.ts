import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class ListResponse<T> {
    @Expose()
    @ApiProperty()
    public total = 0

    @Expose()
    @ApiProperty()
    public limit = 0

    @Expose()
    @ApiProperty()
    public page = 1

    @Expose()
    @ApiProperty()
    public data: T[] = []
}

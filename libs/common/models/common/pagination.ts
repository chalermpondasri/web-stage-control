import { Transform } from 'class-transformer'
import { IsNumber, IsOptional, Min } from 'class-validator'

export class Pagination {
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Transform((v) => (v?.obj?.limit ? Number(v?.obj?.limit) : 20))
    public limit = 20

    @IsOptional()
    @Min(1)
    @Transform((v) => (v?.obj?.page ? Number(v?.obj?.page) : 1))
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
    public query: string
}

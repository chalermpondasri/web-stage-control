import { Expose } from 'class-transformer'

export class ListResponse<T> {
    @Expose() public total = 0
    @Expose() public limit = 0
    @Expose() public page = 1
    @Expose() public data: T[] = []
}

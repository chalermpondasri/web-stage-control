import { Pagination } from '@libs/common/models/common/pagination'

describe('Pagination', () => {
    it('can handle default pagination', () => {
        const pagination = new Pagination()

        expect(pagination.limit).toEqual(20)
        expect(pagination.page).toEqual(1)
    })
    it('can handle sql-style pagination value', () => {
        const pagination = new Pagination()
        pagination.page = 2
        pagination.limit = 25

        expect(pagination.toTake()).toEqual(25)
        expect(pagination.toSkip()).toEqual(25)

        pagination.page = 5
        pagination.limit = 20

        expect(pagination.toSkip()).toEqual(80)
        expect(pagination.toTake()).toEqual(20)
    })
})

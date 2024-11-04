import { parseThaiDate, toThaiBuddhistEraDateTimeString } from '../thai-date-parser'

describe('date utils', () => {
    it('can transform date', () => {
        const result = parseThaiDate('21/07/1987', '16:30')
        expect(result).toEqual(new Date('1987-07-21T09:30:00.000Z'))
    })

    it('can parse date into thai date format', () => {
        const d = parseThaiDate('21/07/1987', '16:30')
        const result = toThaiBuddhistEraDateTimeString(d)
        expect(result).toEqual('21/07/2530 16:30')
    })
})

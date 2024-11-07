import dayjs from 'dayjs'
import 'dayjs/locale/th'
import buddhistEra from 'dayjs/plugin/buddhistEra'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)
dayjs.extend(buddhistEra)

/**
 * transform thai datetime into Date using dayjs
 * @param {string} thaiDate eg. 18/07/2022
 * @param {string} thaiTime eg. 16:30
 * @returns {Date}
 */
export const parseThaiDate = (thaiDate: string, thaiTime: string): Date => {
    return dayjs(`${thaiDate} ${thaiTime} +0700`, 'DD/MM/YYYY HH:mm ZZ').toDate()
}

/**
 * transform date into thai buddhist calendar string format
 * @param {Date} date
 * @returns {string}
 */
export const toThaiBuddhistEraDateTimeString = (date: Date): string => {
    return dayjs(date).locale('th').format('DD/MM/BBBB HH:mm')
}

export const toThaiBuddhistEraDateString = (date: Date): string => {
    return dayjs(date).locale('th').format('DD/MM/BBBB')
}

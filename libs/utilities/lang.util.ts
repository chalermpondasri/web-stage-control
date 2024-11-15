export function detectLanguage(text) {
    const thaiRegex = /[\u0E00-\u0E7F]/ // Thai Unicode range

    if (thaiRegex.test(text)) {
        return Lang.Thai
    } else {
        return Lang.Other
    }
}

export enum Lang {
    Thai = 'Thai',
    Other = 'Other',
}

export function blurProfileName(name: string): string {
    return `${name.charAt(0)}${name.charAt(1)}******`
}

export function wildCardQuery(query: string): string {
    if (!query) {
        return ''
    }

    return `%${query}%`
}

export function maskName(name: string) {
    if (name.length <= 4) {
        return '****'
    }
    const firstPart = name.slice(0, 2)
    const lastPart = name.slice(-2)
    const stars = '*'.repeat(name.length - 5)
    return firstPart + stars + lastPart
}

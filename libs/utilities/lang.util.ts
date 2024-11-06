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
    if (name.length <= 5) {
        return '***'
    }
    return `${name.charAt(0)}${name.charAt(1)}***${name.charAt(name.length - 1)}`
}

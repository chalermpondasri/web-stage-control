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

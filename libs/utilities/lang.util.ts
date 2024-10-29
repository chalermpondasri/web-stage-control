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

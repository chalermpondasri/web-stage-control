export function generateRandomAlphanumeric(length: number): string {
    const characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result: string = '';
    for (let i = 0; i < length; i++) {
        const randomIndex: number = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result
}
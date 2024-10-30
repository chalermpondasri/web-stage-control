export const extractTokenFromHeader = (headerValue: string): string | undefined => {
    const [type, token] = headerValue?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
}

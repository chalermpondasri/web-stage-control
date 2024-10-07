export interface IVerifyTokenPayload {
    code: string
}

export interface IVerifyTokenResponse {
    access_token: string
    token_type: string
    refresh_token: string
    expires_in: number
    scope: string
    id_token: string
}
export interface ILineRepository {
    verifyToken(payload: IVerifyTokenPayload): Promise<IVerifyTokenResponse>
}
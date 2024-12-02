import { Observable } from 'rxjs'

export interface IVerifyTokenPayload {
    code: string
}

export interface ILineAccessTokenResponse {
    access_token: string
    token_type: string
    refresh_token: string
    expires_in: number
    scope: string
    id_token: string
}

export interface ILineVerifyTokenResponse {
    client_id: string,
    expires_in: number,
    scope: string

}

export interface ILineUserProfileResponse {
    userId: string
    displayName: string
    pictureUrl: string
}

export interface ILineRepository {
    issueAccessToken(payload: IVerifyTokenPayload): Observable<ILineAccessTokenResponse>

    verifyAccessToken(lineAccessToken: string): Observable<ILineVerifyTokenResponse>

    getUserProfile(accessToken: string): Observable<ILineUserProfileResponse>
}
import {
    ILineRepository,
    IVerifyTokenPayload,
    ILineAccessTokenResponse,
    ILineUserProfileResponse,
    ILineVerifyTokenResponse,
} from '@libs/repositories/interfaces/line.interface'
import { AxiosInstance } from 'axios'
import { EnvironmentConfig } from '@libs/common/models'
import qs from 'qs'
import {
    from,
    map,
    Observable,
} from 'rxjs'

export class LineRepository implements ILineRepository {
    public constructor(
        private readonly _httpClient: AxiosInstance,
        private readonly _config: EnvironmentConfig,
    ) {
        this._httpClient.defaults.baseURL = `https://api.line.me`

    }

    public issueAccessToken(payload: IVerifyTokenPayload): Observable<ILineAccessTokenResponse> {
        const data = {
            code: payload.code,
            client_id: this._config.LINE_CLIENT_ID,
            client_secret: this._config.LINE_CLIENT_SECRET,
            redirect_uri: this._config.LINE_REDIRECT_URI,
            grant_type: 'authorization_code',
        }

        return from(this._httpClient.post(`/oauth2/v2.1/token`, qs.stringify(data))).pipe(
            map(result => result.data)
        )

    }

    public verifyAccessToken(lineAccessToken: string): Observable<ILineVerifyTokenResponse> {

        return from(this._httpClient.get(`/oauth2/v2.1/verify`, {
            params: { access_token: lineAccessToken },
        })).pipe(
            map(result => result.data)
        )

    }

    public getUserProfile(accessToken: string): Observable<ILineUserProfileResponse> {
        return from(this._httpClient.request({
            url: '/v2/profile',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })).pipe(
            map(result => result.data)
        )
    }

}

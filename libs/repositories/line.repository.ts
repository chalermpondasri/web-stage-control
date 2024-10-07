import {
    ILineRepository,
    IVerifyTokenPayload,
    IVerifyTokenResponse,
} from '@libs/repositories/interfaces/line.interface'
import { AxiosInstance } from 'axios'
import { EnvironmentConfig } from '@libs/common/models'
import qs from 'qs'

export class LineRepository implements ILineRepository {
    public constructor(
        private readonly _httpClient: AxiosInstance,
        private readonly _config: EnvironmentConfig,
    ) {
        this._httpClient.defaults.baseURL = `https://api.line.me/oauth2/v2.1`

    }

    public async verifyToken(payload: IVerifyTokenPayload): Promise<IVerifyTokenResponse> {
        const data  = {
            code: payload.code,
            client_id: this._config.LINE_CLIENT_ID,
            client_secret: this._config.LINE_CLIENT_SECRET,
            redirect_uri: this._config.LINE_REDIRECT_URI,
            grant_type: 'authorization_code',
        }

        const result = await this._httpClient.post(`/token`, qs.stringify(data))

        return result.data

    }

}

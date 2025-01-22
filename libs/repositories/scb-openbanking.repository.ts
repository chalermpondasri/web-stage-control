import {
    IOpenBanking,
    IQr30Data,
    IQr30PaymentRequest,
} from '@libs/repositories/interfaces/openbanking/open-banking.interface'
import { AxiosInstance } from 'axios'
import { EnvironmentConfig } from '@libs/common/models'
import {
    InternalServerErrorException,
    Logger,
} from '@nestjs/common'
import { v7 } from 'uuid'
import {
    catchError,
    from,
    map,
    mergeMap,
    Observable,
    of,
    tap,
    throwError,
} from 'rxjs'
import { Qr30PaymentRequest } from '@libs/repositories/interfaces/openbanking/qr30-payment.request'
import {
    plainToClassFromExist,
} from 'class-transformer'

interface TokenInfo {
    token: string,
    expiresAt: number,
}

interface ScbTokenResponse {
    status: {
        code: number
        description: string
    }
    data: {
        accessToken: string
        tokenType: string
        expiresIn: number
        expiresAt: number
        refreshToken: string
        refreshExpiresIn: number
        refreshExpiresAt: number
    }
}

export class ScbOpenBankingRepository implements IOpenBanking {
    private readonly _logger: Logger = new Logger(ScbOpenBankingRepository.name)

    private _access?: TokenInfo
    private _refresh?: TokenInfo

    public constructor(
        private readonly _config: EnvironmentConfig,
        private readonly _httpClient: AxiosInstance,
    ) {
        this._httpClient.defaults.baseURL = this._config.OPEN_BANKING_ENDPOINT
        this._httpClient.defaults.headers.common['Content-Type'] = 'application/json'
        this._httpClient.defaults.headers.common['resourceOwnerId'] = this._config.OPEN_BANKING_RESOURCE_OWNER_ID
        this._httpClient.defaults.headers.common['Accept-Language'] = 'EN'

        this._httpClient.interceptors.request.use(value => {
            const uuid = v7()
            value.headers['requestUId'] = uuid

            if(!!this._access && this._access.expiresAt > Date.now()) {
                value.headers.setAuthorization(`Bearer ${this._access.token}`)
            }

            this._logger.log(`requestUId: ${uuid}`)

            return value
        })
        this._httpClient.interceptors.response.use(null, (err) => {
            console.log(err)
            throw err
        })
    }

    private _initToken(): Observable<ScbTokenResponse> {
        return from(this._httpClient.post(
            `/v1/oauth/token`,
            {
                applicationKey: this._config.OPEN_BANKING_APPLICATION_KEY,
                applicationSecret: this._config.OPEN_BANKING_SECRET_KEY,
            },
        )).pipe(
            map(result => {
                return <ScbTokenResponse>result.data
            }),
            catchError(err => {
                this._logger.error(err)
                return throwError(() => new InternalServerErrorException(err))
            }),
        )

    }

    private _doRefreshToken(refreshToken: string): Observable<ScbTokenResponse> {
        return from(this._httpClient.post(
            `/v1/oauth/token/refresh`,
            {
                applicationKey: this._config.OPEN_BANKING_APPLICATION_KEY,
                applicationSecret: this._config.OPEN_BANKING_SECRET_KEY,
                refreshToken: refreshToken,
            },
        )).pipe(
            map(result => {
                return <ScbTokenResponse>result.data
            }),
            catchError(err => {
                this._logger.error(err)
                return throwError(() => new InternalServerErrorException(err))
            }),
        )
    }

    private _getAccessToken(): Observable<string> {

        const mapToken = (tokenInfo: ScbTokenResponse) => {

            this._access = {
                token: tokenInfo.data.accessToken,
                expiresAt: tokenInfo.data.expiresAt * 1000,
            }

            this._refresh = {
                token: tokenInfo.data.refreshToken,
                expiresAt: tokenInfo.data.refreshExpiresAt * 1000,
            }

        }

        return of(({access: this._access, refresh: this._refresh})).pipe(
            mergeMap(({ access, refresh }) => {
                if (access?.expiresAt >= (Date.now() - 10000)) {
                    return of(this._access.token)
                }

                return of(refresh?.expiresAt >= (Date.now() - 10000)).pipe(
                    mergeMap(isValid => {
                        if(isValid) {
                            return  this._doRefreshToken(refresh.token)
                        }
                        return this._initToken()
                    }),
                    tap((response) => mapToken(response)),
                    map(response => response.data.accessToken),
                )

            }),
        )

    }


    public generateQrCode(request: IQr30PaymentRequest): Observable<IQr30PaymentRequest & IQr30Data> {
        const data = new Qr30PaymentRequest(this._config.OPEN_BANKING_REF_PREFIX)
        const payload = plainToClassFromExist(data, request)

        return this._getAccessToken().pipe(
            mergeMap(() => {
                return this._httpClient.post(`/v1/payment/qrcode/create`, {
                    ...payload.extract(),
                    ppId: this._config.OPEN_BANKING_BILLER_ID,
                    qrType: 'PP',
                    ppType: 'BILLERID',
                })
            }),
            map(({data}) => ({
                ...payload.extract(),
                ...data,
            }))
        )
    }
}
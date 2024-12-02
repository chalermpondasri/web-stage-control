import { Observable } from 'rxjs'
import { TokenDto } from '@libs/common/models/common/token.dto'
import { RefreshTokenRequest } from '@libs/common/models/user/refresh-token.request'

export interface IAuthenticationService {
    createUser(username: string, password: string): Observable<any>
    doLogin(username: string, password: string): Observable<TokenDto>
    doLineWebLogin(code: string): Observable<TokenDto>
    doLineMobileLogin(accessToken: string): Observable<TokenDto>
    refreshToken(request: RefreshTokenRequest): Observable<TokenDto>
}
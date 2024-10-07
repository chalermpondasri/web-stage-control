import { Observable } from 'rxjs'
import { TokenDto } from '@libs/common/models/common/token.dto'

export interface IAuthenticationService {
    createUser(username: string, password: string): Observable<any>
    doLogin(username: string, password: string): Observable<TokenDto>
    doLineLogin(code: string): Observable<TokenDto>
}
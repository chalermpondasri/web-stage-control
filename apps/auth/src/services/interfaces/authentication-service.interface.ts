import { Observable } from 'rxjs'
import { TokenDto } from '@libs/common/models/common/token.dto'
import { MessageEvent } from '@nestjs/common'

export interface IAuthenticationService {
    createUser(username: string, password: string): Observable<any>
    doLogin(username: string, password: string): Observable<TokenDto>
    doLineLogin(code: string): Observable<TokenDto>
    subscribeSse(): Observable<MessageEvent>
}
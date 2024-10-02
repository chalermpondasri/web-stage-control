import { Observable } from 'rxjs'

export interface IAuthenticationService {
    createUser(username: string, password: string): Observable<any>
    doLogin(username: string, password: string): Observable<{accessToken: string, refreshToken: string}>
}
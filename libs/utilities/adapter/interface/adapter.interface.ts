import { Observable } from 'rxjs'

export interface IDiscordAdapter {
    sendMessage(message: string): Observable<boolean>
}

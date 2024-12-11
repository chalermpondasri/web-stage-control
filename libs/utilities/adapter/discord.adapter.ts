import { IDiscordAdapter } from '@libs/utilities/adapter/interface/adapter.interface'
import {
    from,
    Observable,
} from 'rxjs'
import axios, { AxiosInstance } from 'axios'

export class DiscordAdapter implements IDiscordAdapter {

    private readonly _axiosClient: AxiosInstance

    constructor(
        baseUrl: string
    ) {
        this._axiosClient = axios.create({
            baseURL: baseUrl,
        })
    }

    public sendMessage(message: string): Observable<boolean> {
        return from(this._axiosClient.post('', {
            content: message,
        }).then(() => true).catch(() => false))
    }
}

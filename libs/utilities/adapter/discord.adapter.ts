import { IDiscordAdapter } from '@libs/utilities/adapter/interface/adapter.interface'
import {
    from,
    Observable,
} from 'rxjs'
import axios, { AxiosInstance } from 'axios'

export class DiscordAdapter implements IDiscordAdapter {

    private readonly _axiosClient: AxiosInstance

    constructor() {
        this._axiosClient = axios.create({
            url: 'https://discord.com/api/webhooks/1316244484425777232/SUtC7qmAPA5bBw1NmTxYipQvLBaqUG1ma26hPUibtH5ekvqHWa2v4fupSeUOnw8F_t4t',
        })
    }

    public sendMessage(message: string): Observable<boolean> {
        return from(this._axiosClient.post('', {
            content: message
        }).then(() => true).catch(() => false))
    }

}
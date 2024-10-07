import {
    Logger,
    Provider,
    Scope,
} from '@nestjs/common'
import { ProviderName } from '@libs/common/constants/providerName'
import http from 'http'
import axios, { AxiosInstance } from 'axios'

export const httpClientProvider: Provider = {
    provide: ProviderName.HTTP_CLIENT,
    scope: Scope.TRANSIENT,
    useFactory: (): AxiosInstance => {
        const agent = new http.Agent({family: 4})
        const client =  axios.create({
            httpAgent: agent,
        })

        client.interceptors.request.use( (conf) => {
            Logger.log(conf, ProviderName.HTTP_CLIENT)
            return conf
        })

        return client
    }
}
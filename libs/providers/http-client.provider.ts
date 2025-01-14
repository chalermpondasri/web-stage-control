import {
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
        return axios.create({
            httpAgent: agent,
        })
    }
}
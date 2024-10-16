import { Client, ClientOptions } from '@elastic/elasticsearch'
import { ProviderName } from '@libs/common/constants/providerName'
import { EnvironmentConfig } from '@libs/common/models'
import { Provider } from '@nestjs/common'

export const elasticClientProvider: Provider = {
    provide: ProviderName.ELASTIC_CLIENT,
    inject: [ProviderName.ENV_CONFIG],
    useFactory: async (config: EnvironmentConfig) => {
        const ca = Buffer.from(config.ELASTIC_CLIENT_CA, 'base64').toString()
        const elasticClientConfig: ClientOptions = {
            nodes: config.ELASTIC_CLIENT_NODES,
            auth: {
                username: config.ELASTIC_CLIENT_USERNAME,
                password: config.ELASTIC_CLIENT_PASSWORD,
            },
        }

        if (config.NODE_ENV !== 'development') {
            elasticClientConfig.tls = {
                ca,
            }
        }

        const client = new Client(elasticClientConfig)
        await client.info()
        return client
    },
}

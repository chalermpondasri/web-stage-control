import { Provider } from '@nestjs/common'
import { ProviderName } from '@libs/common/constants'
import axios from 'axios'
import { AppleIntegrationRepository } from '@libs/repositories/apple/apple-integration.repository'
import { EnvironmentConfig } from '@libs/common/models'

export const appleIntegrationProvider: Provider = {
    provide: ProviderName.APPLE_INTEGRATION,
    inject: [
        ProviderName.ENV_CONFIG,
    ],
    useFactory: async (config: EnvironmentConfig) => {
        const response = await axios.get(`https://appleid.apple.com/auth/keys`)

        // const secret = Buffer.from(config.APPLE_BASE64_PRIVATE_KEY, 'base64')
        return new AppleIntegrationRepository(
            config.APPLE_TEAM_ID,
            config.APPLE_CLIENT_ID,
            config.APPLE_KEY_ID,
            response.data,
            null, //secret.toString(),
        )

    },

}
import { Provider } from '@nestjs/common'
import { ProviderName } from '@libs/common/constants/providerName'
import { AuthenticationService } from '../services/authentication.service'
import { Repository } from 'typeorm'
import { User } from '@libs/entities/user'
import { IEncryptionService } from '@libs/providers/encryption.provider'
import { EnvironmentConfig } from '@libs/common/models'
import { TokenizationService } from '../services/tokenization.service'
import { ITokenizationService } from '../services/interfaces/tokenization-service.interface'

export const authenticationServiceProvider: Provider = {
    provide: ProviderName.AUTHENTICATION_SERVICE,
    inject: [
        ProviderName.USER_REPOSITORY,
        ProviderName.ENCRYPTION_SERVICE,
        ProviderName.TOKENIZATION_SERVICE,
    ],
    useFactory: (
        userRepository: Repository<User>,
        encryptionService: IEncryptionService,
        tokenizationService: ITokenizationService,
    ) => {
        return new AuthenticationService(
            userRepository,
            encryptionService,
            tokenizationService,
        )
    },
}

export const tokenizationServiceProvider: Provider = {
    provide: ProviderName.TOKENIZATION_SERVICE,
    inject: [ProviderName.ENV_CONFIG],
    useFactory: (config: EnvironmentConfig) => {
        const { JWT_ACCESS_SECRET, JWT_ACCESS_TTL, JWT_REFRESH_SECRET, JWT_REFRESH_TTL } = config
        return new TokenizationService(JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, JWT_ACCESS_TTL, JWT_REFRESH_TTL)
    },
}

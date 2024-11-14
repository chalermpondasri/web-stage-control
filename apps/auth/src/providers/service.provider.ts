import {
    MessageEvent,
    Provider,
} from '@nestjs/common'
import { ProviderName } from '@libs/common/constants/providerName'
import { AuthenticationService } from '../services/authentication.service'
import { Repository } from 'typeorm'
import { IEncryptionService } from '@libs/providers/encryption.provider'
import { EnvironmentConfig } from '@libs/common/models'
import { TokenizationService } from '@libs/providers/tokenization/tokenization.service'
import { ITokenizationService } from '@libs/providers/tokenization/tokenization-service.interface'
import { Admin } from '@libs/entities/admin.entity'
import { ILineRepository } from '@libs/repositories/interfaces/line.interface'
import { Community } from '@libs/entities/community.entity'
import { User } from '@libs/entities/user.entity'
import { Subject } from 'rxjs'
import { UserService } from '../services/user.service'
import { RequestContext } from '@libs/providers/request-context.provider'
import { Stage } from '@libs/entities/stage.entity'

export const authenticationServiceProvider: Provider = {
    provide: ProviderName.AUTHENTICATION_SERVICE,
    inject: [
        ProviderName.SSE_SUBJECT,
        ProviderName.ADMIN_REPOSITORY,
        ProviderName.ENCRYPTION_SERVICE,
        ProviderName.TOKENIZATION_SERVICE,
        ProviderName.LINE_REPOSITORY,
        ProviderName.USER_REPOSITORY,
        ProviderName.COMMUNITY_REPOSITORY,
        ProviderName.STAGE_REPOSITORY,
    ],
    useFactory: (
        sseSubject: Subject<MessageEvent>,
        adminRepository: Repository<Admin>,
        encryptionService: IEncryptionService,
        tokenizationService: ITokenizationService,
        lineRepository: ILineRepository,
        userRepository: Repository<User>,
        communityRepository: Repository<Community>,
        stageRepository: Repository<Stage>,
    ) => {
        return new AuthenticationService(
            sseSubject,
            adminRepository,
            encryptionService,
            tokenizationService,
            lineRepository,
            userRepository,
            communityRepository,
            stageRepository,
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

export const userServiceProvider: Provider = {
    provide: ProviderName.USER_SERVICE,
    inject: [
        ProviderName.USER_REPOSITORY,
        ProviderName.TOKENIZATION_SERVICE,
        ProviderName.REQUEST_CONTEXT,
    ],
    useFactory: (
        userRepository: Repository<User>,
        tokenizationService: ITokenizationService,
        requestContext: RequestContext,
    ) => new UserService(userRepository,  tokenizationService, requestContext),
}
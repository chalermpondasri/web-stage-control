import { Repository } from 'typeorm'
import { User } from '@libs/entities/user'
import {
    BadRequestException,
    Inject,
} from '@nestjs/common'
import { ProviderName } from '@libs/common/constants/providerName'
import {
    from,
    map,
    mergeMap,
    Observable,
    throwError,
} from 'rxjs'
import { IAuthenticationService } from './interfaces/authentication-service.interface'
import { IEncryptionService } from '@libs/providers/encryption.provider'
import { ITokenizationService } from './interfaces/tokenization-service.interface'

import { UserDto } from '@libs/common/models/user/login.dto'
import {
    instanceToInstance,
    classToClassFromExist,
    instanceToPlain,
    plainToInstance,
} from 'class-transformer'

export class AuthenticationService implements IAuthenticationService {
    public constructor(
        @Inject(ProviderName.USER_REPOSITORY)
        private readonly _userRepository: Repository<User>,
        @Inject(ProviderName.ENCRYPTION_SERVICE)
        private readonly _encryptionService: IEncryptionService,
        @Inject(ProviderName.TOKENIZATION_SERVICE)
        private readonly _tokenizationService: ITokenizationService,
    ) {

    }

    public doLogin(username: string, password: string): Observable<{ accessToken: string, refreshToken: string }> {
        return from(this._userRepository.findOneBy({ username })).pipe(
            map(user => {
                if (!user || password !== this._encryptionService.decrypt({ encrypted: Buffer.from(user.secret, 'base64') })) {
                    throw new BadRequestException('LOGIN_FAILED')
                }
                const userDto = plainToInstance(UserDto, instanceToPlain( user), {excludeExtraneousValues: true})

                const accessToken = this._tokenizationService.createAccessToken(instanceToPlain(userDto))
                const refreshToken = this._tokenizationService.createRefreshToken(instanceToPlain(userDto))

                return {
                    accessToken,
                    refreshToken,
                }
            }),
        )
    }

    public createUser(username: string, password: string): Observable<any> {
        const user = this._userRepository.create({
            username,
            secret: this._encryptionService.encrypt(password).encrypted.toString('base64'),
        })
        return from(this._userRepository.findOneBy({ username })).pipe(
            mergeMap(result => {
                if (!!result) {
                    return throwError(() => new BadRequestException('USER_EXISTED'))
                }
                return from(this._userRepository.save(user))
            }),
            map(result => {
                return {
                    id: result.id,
                }
            }),
        )
    }

}
import { IUserService } from './interfaces/user-service.interface'
import { UpdateConsentRequest } from '@libs/common/models/user/update-consent.request'
import {
    from,
    map,
    mergeMap,
    Observable,
} from 'rxjs'
import { TokenDto } from '@libs/common/models/common/token.dto'
import { Repository } from 'typeorm'
import { User } from '@libs/entities/user.entity'
import {
    UnauthorizedException,
} from '@nestjs/common'
import { ErrorEnum } from '@libs/common/constants/error.enum'
import { fromPromise } from 'rxjs/internal/observable/innerFrom'
import {
    instanceToPlain,
    plainToInstance,
} from 'class-transformer'
import { UserDto } from '@libs/common/models/user/user.dto'
import { ITokenizationService } from './interfaces/tokenization-service.interface'
import { RequestContext } from '@libs/providers/request-context.provider'

export class UserService implements IUserService {
    public constructor(
        private readonly _userRepository: Repository<User>,
        private readonly _tokenizationService: ITokenizationService,
        private readonly _requestContext: RequestContext,
    ) {
    }

    public updateUserConsent(request: UpdateConsentRequest): Observable<TokenDto> {
        if(!request.consentAccepted) {
            throw new UnauthorizedException(ErrorEnum.UPDATE_USER_USER_NOT_ACCEPT_CONSENT)
        }

        return from(this._userRepository.findOneBy({ id: this._requestContext.identityInfo.userId})).pipe(
            mergeMap(user => {
                user.isConsentAccepted = request.consentAccepted
                user.acceptedConsent = request.consent
                return fromPromise(this._userRepository.save(user))
            }),
            map((user: User) => {
                const userDto = plainToInstance(UserDto, instanceToPlain(user), { excludeExtraneousValues: true })
                const accessToken = this._tokenizationService.createAccessToken(instanceToPlain(userDto))
                const refreshToken = this._tokenizationService.createRefreshToken(instanceToPlain(userDto))

                return plainToInstance(TokenDto, {accessToken, refreshToken})
            }),
        )

    }

}
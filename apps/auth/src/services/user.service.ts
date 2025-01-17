import { IUserService } from './interfaces/user-service.interface'
import { UpdateConsentRequest } from '@libs/common/models/user/update-consent.request'
import {
    from,
    map,
    mergeMap,
    Observable,
    throwError,
} from 'rxjs'
import { TokenDto } from '@libs/common/models/common/token.dto'
import { Repository } from 'typeorm'
import { User } from '@libs/entities/user.entity'
import {
    BadRequestException,
    Logger,
    UnauthorizedException,
} from '@nestjs/common'
import { ErrorEnum } from '@libs/common/constants/error.enum'
import { fromPromise } from 'rxjs/internal/observable/innerFrom'
import {
    instanceToPlain,
    plainToInstance,
} from 'class-transformer'
import { UserDto } from '@libs/common/models/user/user.dto'
import { ITokenizationService } from '@libs/providers/tokenization/tokenization-service.interface'
import { RequestContext } from '@libs/providers/request-context.provider'
import { UserProfileDto } from '@libs/common/models/user/user-profile.dto'
import { UpdateProfileRequest } from '@libs/common/models/user/update-profile.request'
import { IBadWordService } from '@libs/providers/bad-word.provider'
import { isNil } from 'lodash'

export class UserService implements IUserService {
    private readonly _logger = new Logger(UserService.name)

    public constructor(
        private readonly _userRepository: Repository<User>,
        private readonly _tokenizationService: ITokenizationService,
        private readonly _requestContext: RequestContext,
        private readonly _badWordService: IBadWordService,
    ) {
    }

    public updateUserConsent(request: UpdateConsentRequest): Observable<TokenDto> {
        if (!request.consentAccepted) {
            throw new UnauthorizedException(ErrorEnum.UPDATE_USER_USER_NOT_ACCEPT_CONSENT)
        }

        return from(this._userRepository.findOneBy({ id: this._requestContext.identityInfo.userId })).pipe(
            mergeMap(user => {
                user.isConsentAccepted = request.consentAccepted
                user.acceptedConsent = request.consent
                return fromPromise(this._userRepository.save(user))
            }),
            map((user: User) => {
                const userDto = plainToInstance(UserDto, instanceToPlain(user), { excludeExtraneousValues: true })
                const accessToken = this._tokenizationService.createAccessToken(instanceToPlain(userDto))
                const refreshToken = this._tokenizationService.createRefreshToken(instanceToPlain(userDto))

                return plainToInstance(TokenDto, { accessToken, refreshToken })
            }),
        )

    }

    public getUserProfile(): Observable<UserProfileDto> {
        return from(this._userRepository.findOneBy({ id: this._requestContext.identityInfo.userId })).pipe(
            map((user: User) => {
                const dto = plainToInstance(UserProfileDto, instanceToPlain(user), { excludeExtraneousValues: true })
                dto.totalVouchers = 0
                return dto
            }),
        )
    }

    public updateUserProfile(request: UpdateProfileRequest): Observable<UserProfileDto> {
        const userId = this._requestContext.identityInfo.userId
        return this._badWordService.censorThaiCurseWords(request.name).pipe(
            map(wordName => {
                if(wordName === '***') {
                    this._logger.log(`[UpdateUser] UserID : ${userId} try to change name : ${request.name}`)
                    throwError(() => new BadRequestException(ErrorEnum.NAME_ILLEGAL))
                }
                return wordName
            }),
            mergeMap(nameCensor => {
                return from(this._userRepository.findOneBy({ id: userId })).pipe(
                    mergeMap((user: User) => {
                        user.email = request.email ? request.email : user.email
                        user.name = nameCensor
                        user.phoneNumber = request.phoneNumber ? request.phoneNumber : user.phoneNumber
                        user.setting.showProfile = request.enableShowProfileImage
                        user.setting.showName = request.enableShowProfileName
                        user.isDarkMode = isNil(request.isDarkMode) ? user.isDarkMode : request.isDarkMode
                        return fromPromise(this._userRepository.save(user))
                    }),
                    mergeMap(() => this.getUserProfile()),
                )
            })
        )
    }

}
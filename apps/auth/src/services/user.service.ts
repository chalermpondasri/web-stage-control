import { IUserService } from './interfaces/user-service.interface'
import { UpdateConsentRequest } from '@libs/common/models/user/update-consent.request'
import {
    catchError,
    from,
    map,
    mergeMap,
    Observable,
    of,
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
import {
    decode,
    JwtPayload,
} from 'jsonwebtoken'
import { ILineRepository } from '@libs/repositories/interfaces/line.interface'
import { fromPromise } from 'rxjs/internal/observable/innerFrom'
import {
    instanceToPlain,
    plainToInstance,
} from 'class-transformer'
import { UserDto } from '@libs/common/models/user/user.dto'
import { ITokenizationService } from './interfaces/tokenization-service.interface'

export class UserService implements IUserService {
    private readonly _logger = new Logger(UserService.name)
    public constructor(
        private readonly _userRepository: Repository<User>,
        private readonly _lineRepository: ILineRepository,
        private readonly _tokenizationService: ITokenizationService,
    ) {
    }
    public updateUserConsent(request: UpdateConsentRequest): Observable<TokenDto> {
        if(!request.consentAccepted) {
            throw new UnauthorizedException(ErrorEnum.UPDATE_USER_USER_NOT_ACCEPT_CONSENT)
        }

        return from(this._lineRepository.verifyToken({code: request.authorizationCode})).pipe(
            catchError(err => {
                this._logger.error(err)
                return throwError(() => new BadRequestException(ErrorEnum.LOGIN_INVALID_TOKEN))
            }),
            mergeMap(response => {
                const decoded = <JwtPayload> decode(response.id_token)
                const { sub, name, picture } = decoded
                return from(this._userRepository.findOneBy({ lineId: decoded.sub})).pipe(
                    mergeMap(user => {
                        // if user not existed
                        if (!user) {
                            const entity = this._userRepository.create({
                                lineId: sub,
                                name,
                                picture,
                                isConsentAccepted: request.consentAccepted,
                                acceptedConsent: request.consent,
                            })
                            return fromPromise(this._userRepository.save(entity))
                        }
                        // return founded user
                        return of(user)
                    }),
                    map((user: User) => {
                        const userDto = plainToInstance(UserDto, instanceToPlain(user), { excludeExtraneousValues: true })
                        const accessToken = this._tokenizationService.createAccessToken(instanceToPlain(userDto))
                        const refreshToken = this._tokenizationService.createRefreshToken(instanceToPlain(userDto))

                        return plainToInstance(TokenDto, {accessToken, refreshToken})
                    }),
                )
            })
        )

    }
}
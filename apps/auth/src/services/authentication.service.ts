import { Repository } from 'typeorm'
import {
    BadRequestException,
    Logger,
    LoggerService,
    MessageEvent,
} from '@nestjs/common'
import {
    catchError,
    from,
    map,
    mergeMap,
    Observable,
    of,
    Subject,
    throwError,
} from 'rxjs'
import { IAuthenticationService } from './interfaces/authentication-service.interface'
import { IEncryptionService } from '@libs/providers/encryption.provider'
import { ITokenizationService } from './interfaces/tokenization-service.interface'

import {
    instanceToPlain,
    plainToInstance,
} from 'class-transformer'
import { TokenDto } from '@libs/common/models/common/token.dto'
import { ILineRepository } from '@libs/repositories/interfaces/line.interface'
import { Admin } from '@libs/entities/admin.entity'
import {
    decode,
    JwtPayload,
} from 'jsonwebtoken'
import { UserDto } from '@libs/common/models/user/user.dto'
import { AdminUserDto } from '@libs/common/models/user/admin-user.dto'
import { Community } from '@libs/entities/community.entity'
import { User } from '@libs/entities/user.entity'
import dayjs from 'dayjs'
import { ItemUpdateDto } from '@libs/common/models/media/item-update.dto'
import { ErrorEnum } from '@libs/common/constants/error.enum'

export class AuthenticationService implements IAuthenticationService {
    private readonly _logger: LoggerService

    public constructor(
        private readonly _sseSubject: Subject<MessageEvent>,
        private readonly _adminRepository: Repository<Admin>,
        private readonly _encryptionService: IEncryptionService,
        private readonly _tokenizationService: ITokenizationService,
        private readonly _lineRepository: ILineRepository,
        private readonly _userRepository: Repository<User>,
        private readonly _communityRepository: Repository<Community>,
    ) {
        this._logger = new Logger(AuthenticationService.name)
    }

    public doLogin(username: string, password: string): Observable<TokenDto> {
        return from(this._adminRepository.findOneBy({ username })).pipe(
            map(user => {
                if (!user || password !== this._encryptionService.decrypt({ encrypted: Buffer.from(user.secret, 'base64') })) {
                    throw new BadRequestException(ErrorEnum.LOGIN_LOGIN_FAILED)
                }

                const mediaUpdateDto: ItemUpdateDto = {
                    mediaId: 1,
                    artist: 'Loremsum',
                    title: 'Lorem Ipsum Dolor Sit Amet',
                    duration: 215,
                    coverImage: null,
                    totalPoint: Date.now() %10000,
                    updatedAt: Date.now(),
                }

                this._sseSubject.next({type:'ITEM_UPDATE', data: mediaUpdateDto})

                const adminUserDto = plainToInstance(AdminUserDto, instanceToPlain(user), { excludeExtraneousValues: true })

                const accessToken = this._tokenizationService.createAccessToken(instanceToPlain(adminUserDto))
                const refreshToken = this._tokenizationService.createRefreshToken(instanceToPlain(adminUserDto))

                return {
                    accessToken,
                    refreshToken,
                }
            }),
        )
    }

    public createUser(username: string, password: string): Observable<any> {
        const user = this._adminRepository.create({
            username,
            secret: this._encryptionService.encrypt(password).encrypted.toString('base64'),
        })
        return from(this._adminRepository.findOneBy({ username })).pipe(
            mergeMap(result => {
                if (!!result) {
                    return throwError(() => new BadRequestException(ErrorEnum.CREATE_USER_USER_EXISTED))
                }
                return from(this._adminRepository.save(user))
            }),
            mergeMap(() => {
                const model = this._communityRepository.create({
                    name: `community-${Date.now()}`,
                    startDate: new Date(),
                    endDate: dayjs().add(1,'year').toDate(),
                })
                return from(this._communityRepository.save(model))
            }),
            map(result => {
                return {
                    id: result.id,
                }
            }),
        )
    }

    public doLineLogin(code: string): Observable<TokenDto> {
        return from(this._lineRepository.verifyToken({ code })).pipe(
            mergeMap(response => {
                const decoded = <JwtPayload> decode(response.id_token)
                return from(this._userRepository.findOneBy({ lineId: decoded.sub, isConsentAccepted: true })).pipe(
                    mergeMap(user => {
                        // if user not existed, or consent not accepted
                        if (!user) {
                            return throwError(() => new BadRequestException(ErrorEnum.LOGIN_CONSENT_REQUIRED))
                        }
                        // return founded user
                        return of(user)
                    }),
                )
            }),
            map((user: User) => {

                const userDto = plainToInstance(UserDto, instanceToPlain(user), { excludeExtraneousValues: true })
                const accessToken = this._tokenizationService.createAccessToken(instanceToPlain(userDto))
                const refreshToken = this._tokenizationService.createRefreshToken(instanceToPlain(userDto))

                return plainToInstance(TokenDto, {accessToken, refreshToken})
            }),
            catchError(err => {
                this._logger.error(err)
                return throwError(() => new BadRequestException(ErrorEnum.LOGIN_INVALID_TOKEN))
            }),
        )
    }

    public subscribeSse(): Observable<MessageEvent> {
        return this._sseSubject
    }

}
import { Repository } from 'typeorm'
import {
    BadRequestException,
    Logger,
    LoggerService,
    MessageEvent,
    UnauthorizedException,
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
import { ITokenizationService } from '@libs/providers/tokenization/tokenization-service.interface'

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
import { ErrorEnum } from '@libs/common/constants/error.enum'
import { fromPromise } from 'rxjs/internal/observable/innerFrom'
import axios from 'axios'
import _ from 'lodash'
import fs from 'node:fs'
import path from 'path'
import { RefreshTokenRequest } from '@libs/common/models/user/refresh-token.request'
import { Stage } from '@libs/entities/stage.entity'

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
        private readonly _stageRepository: Repository<Stage>,
    ) {
        this._logger = new Logger(AuthenticationService.name)
    }

    public doLogin(username: string, password: string): Observable<TokenDto> {
        return from(this._adminRepository.findOneBy({ username })).pipe(
            map(user => {
                if (!user || password !== this._encryptionService.decrypt({ encrypted: Buffer.from(user.secret, 'base64') })) {
                    throw new BadRequestException(ErrorEnum.LOGIN_LOGIN_FAILED)
                }

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
                    endDate: dayjs().add(1, 'year').toDate(),
                })


                return from(this._communityRepository.save(model)).pipe(
                    mergeMap(comm => {
                        const stageModel = this._stageRepository.create({
                            communityId: comm.id,

                        })

                        return from(this._stageRepository.save(stageModel))
                    })
                )
            }),
            map(result => {
                return {
                    id: result.id,
                }
            }),
        )
    }

    private async _downloadImage(filename: string, imageUrl: string): Promise<string> {

        const imagePath = `./static/${filename}`
        const response = await axios.request({
            url: imageUrl,
            responseType: 'stream',
        })
        return await new Promise((resolve, reject) => {
            response.data
                .pipe(fs.createWriteStream(path.resolve(`./static/${filename}`)))
                .on('finish', () => resolve(imagePath))
                .on('error', e => reject(e))
        })
    }

    public doLineLogin(code: string): Observable<TokenDto> {
        return from(this._lineRepository.verifyToken({ code })).pipe(
            mergeMap(response => {
                const decoded = <JwtPayload>decode(response.id_token)
                const { sub, name, picture } = decoded
                return from(this._userRepository.findOneBy({ lineId: decoded.sub })).pipe(
                    mergeMap(user => {
                        if (!!user) {
                            //TODO for testing purpose
                            user.remainCoins = 9999
                            return fromPromise(this._userRepository.save(user))
                        }
                        const entity = this._userRepository.create({
                            lineId: sub,
                            name,
                            picture: null,
                            isConsentAccepted: false,
                            acceptedConsent: null,
                            setting: { showProfile: true, showName: true },
                        })
                        return fromPromise(this._userRepository.save(entity)).pipe(
                            mergeMap(user => {
                                return fromPromise(this._downloadImage(user.id, picture)).pipe(
                                    mergeMap(() => {
                                        user.picture = `/static/${user.id}`
                                        return fromPromise(this._userRepository.save(user))
                                    }),
                                )
                            }),
                        )
                    }),
                )
            }),
            map((user: User) => this._generateUserToken(user)),
            catchError(err => {
                this._logger.error(err)
                return throwError(() => new UnauthorizedException())
            }),
        )
    }

    private _generateUserToken(user: User): TokenDto {

        const userDto = plainToInstance(UserDto, instanceToPlain(user), { excludeExtraneousValues: true })
        const accessToken = this._tokenizationService.createAccessToken(instanceToPlain(userDto))
        const refreshToken = this._tokenizationService.createRefreshToken(instanceToPlain(userDto))

        return plainToInstance(TokenDto, { accessToken, refreshToken })
    }

    public subscribeSse(): Observable<MessageEvent> {
        return this._sseSubject
    }

    public refreshToken(request: RefreshTokenRequest): Observable<TokenDto> {
        return of(this._tokenizationService.verifyRefreshToken(request.refreshToken)).pipe(
            mergeMap((data) => {
                if (!data) {
                    return throwError(() => new BadRequestException(ErrorEnum.LOGIN_INVALID_TOKEN))
                }

                const id = _.get(data, 'payload.id')

                return from(this._userRepository.findOneBy({ id }))
            }),
            map((model) => this._generateUserToken(model)),
        )
    }

}
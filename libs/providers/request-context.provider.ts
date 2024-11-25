import {
    BadRequestException,
    Inject,
    Injectable,
    Logger,
    NestMiddleware,
    Provider,
    Scope,
} from '@nestjs/common'
import {
    Language,
    parse,
} from 'accept-language-parser'
import {
    NextFunction,
    Request,
    Response,
} from 'express'
import {
    from,
    mergeMap,
    of,
    tap,
} from 'rxjs'
import { get } from 'lodash'
import { IResult } from 'ua-parser-js'
import { v4 } from 'uuid'
import { User } from '@libs/entities/user.entity'
import { Repository } from 'typeorm'
import { UaParserUtil } from '@libs/utilities/ua-parser/ua-parser.util'
import { extractTokenFromHeader } from '@libs/utilities/token.util'
import { isNil } from '@nestjs/common/utils/shared.utils'
import { ErrorEnum } from '@libs/common/constants/error.enum'
import { ProviderName } from '@libs/common/constants/providerName'
import { ITokenizationService } from '@libs/providers/tokenization/tokenization-service.interface'

interface IdentityInfo {
    userId: string
    token: string
    userAgent: IResult
    deviceId: string
    profileId: string
}

export class RequestContext {
    public readonly ts = Date.now()
    public readonly requestId = v4()
    public request: Request
    public languages: Language[] = []
    public identityInfo: IdentityInfo

    public constructor() {
        this.identityInfo = {
            token: null,
            userId: null,
            profileId: null,
            userAgent: null,
            deviceId: null,
        }
    }

    public parseLanguageFromHeader(acceptLang: string): void {
        this.languages = parse(acceptLang)
    }

    public toJson() {
        return {
            timestamp: new Date(this.ts).toISOString(),
            requestId: this.requestId,
            identityInfo: this.identityInfo,
            language: this.languages.map((v) => ({ ...v })),
        }
    }
}

export const requestContextProvider: Provider = {
    provide: ProviderName.REQUEST_CONTEXT,
    scope: Scope.REQUEST,
    useClass: RequestContext,
}

@Injectable({
    scope: Scope.REQUEST,
})
export class RequestContextMiddleware implements NestMiddleware {
    public constructor(
        @Inject(ProviderName.REQUEST_CONTEXT)
        private readonly _rc: RequestContext,
        @Inject(ProviderName.USER_REPOSITORY)
        private readonly _userRepository: Repository<User>,
        @Inject(ProviderName.TOKENIZATION_SERVICE)
        private readonly _tokenization: ITokenizationService,
    ) {
    }

    public use(req: Request, res: Response, next: NextFunction) {
        return of(req)
            .pipe(
                tap((r) => {
                    this._rc.request = r
                    if (r.headers['user-agent']) {
                        this._rc.identityInfo.userAgent = new UaParserUtil(r.headers['user-agent']).getResult()
                    }
                }),
                mergeMap((r) => {
                    if (!r.headers['authorization']) {
                        return of(true)
                    }
                    const token = extractTokenFromHeader(r.headers['authorization'])
                    const data = process.env.NODE_ENV === 'development' ? this._tokenization.decode(token, 'accessToken') : this._tokenization.verifyAccessToken(token)

                    if (!data) {
                        return of(true)
                    }
                    const userId = get(data.payload, 'id', null)
                    if(isNil(userId)) {
                        throw new BadRequestException(ErrorEnum.JWT_PROFILE_INVALID)
                    }
                    return from(this._userRepository.findOneBy({ id: userId })).pipe(
                        tap(result => {
                            this._rc.identityInfo.userId = result.id
                            this._rc.identityInfo.token = token
                        }),
                    )
                }),
            )
            .subscribe({
                complete: () => next(),
                error: (e) => {
                    Logger.log(e, RequestContextMiddleware.name)
                    next(e)
                },
            })
    }
}

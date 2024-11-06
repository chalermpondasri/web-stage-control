import { ProviderName } from '@libs/common/constants'
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
    NextFunction,
    Request,
    Response,
} from 'express'
import {
    EMPTY,
    from,
    mergeMap,
    of,
    tap,
} from 'rxjs'
import { get } from 'lodash'
import { IResult } from 'ua-parser-js'
import { v4 } from 'uuid'
import { ITokenizationService } from '../../apps/auth/src/services/interfaces/tokenization-service.interface'
import { User } from '@libs/entities/user.entity'
import { Repository } from 'typeorm'
import { UaParserUtil } from '@libs/utilities/ua-parser/ua-parser.util'
import { extractTokenFromHeader } from '@libs/utilities/token.util'
import { isNil } from '@nestjs/common/utils/shared.utils'
import { ErrorEnum } from '@libs/common/constants/error.enum'

interface IdentityInfo {
    userId: string
    token: string
    userAgent: IResult
}

export class RequestContext {
    public readonly ts = Date.now()
    public readonly requestId = v4()
    public request: Request
    public identityInfo: IdentityInfo

    public constructor() {
        this.identityInfo = {
            token: null,
            userId: null,
            userAgent: null,
        }
    }

    public toJson() {
        return {
            timestamp: new Date(this.ts).toISOString(),
            requestId: this.requestId,
            identityInfo: this.identityInfo,
        }
    }
}

export const requestContextProvider: Provider = {
    provide: ProviderName.REQUEST_CONTEXT,
    scope: Scope.REQUEST,
    useClass: RequestContext,
}

@Injectable()
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
                        return EMPTY
                    }
                    const token = extractTokenFromHeader(r.headers['authorization'])
                    const data = this._tokenization.verifyAccessToken(token)

                    if (!data) {
                        return EMPTY
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

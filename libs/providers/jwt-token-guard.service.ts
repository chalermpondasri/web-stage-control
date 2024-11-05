import { extractTokenFromHeader } from '@libs/utilities/token.util'
import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
} from '@nestjs/common'
import { Request } from 'express'
import {
    map,
    Observable,
    of,
} from 'rxjs'

import { ProviderName } from '@libs/common/constants/providerName'
import { ITokenizationService } from './tokenization/tokenization-service.interface'

@Injectable()
export class JwtTokenGuard implements CanActivate {
    public constructor(
        @Inject(ProviderName.TOKENIZATION_SERVICE)
        private readonly _tokenizationService: ITokenizationService,
    ) {}

    public canActivate(context: ExecutionContext): Observable<boolean> {
        const request = context.switchToHttp().getRequest() as Request
        const token = extractTokenFromHeader(request.headers.authorization)
        return of(this._tokenizationService.verifyAccessToken(token)).pipe(
            map((result) => {
                return !!result
            }),
        )
    }
}

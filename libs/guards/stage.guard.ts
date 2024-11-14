import { ProviderName } from '@libs/common/constants'
import { extractTokenFromHeader } from '@libs/utilities/token.util'
import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
} from '@nestjs/common'
import { Request } from 'express'
import { ITokenizationService } from '../providers/tokenization/tokenization-service.interface'
import {
    from,
    Observable,
    of,
    tap,
} from 'rxjs'
import { Repository } from 'typeorm'
import { Stage } from '@libs/entities/stage.entity'

@Injectable()
export class StageGuard implements CanActivate {
    public constructor(
        @Inject(ProviderName.TOKENIZATION_SERVICE)
        private readonly _tokenizationService: ITokenizationService,
        @Inject(ProviderName.STAGE_REPOSITORY)
        private readonly _stageRepository: Repository<Stage>,
    ) {
    }

    public canActivate(context: ExecutionContext): Observable<boolean> {
        const request = context.switchToHttp().getRequest() as Request
        const token = extractTokenFromHeader(request.headers.authorization)
        const result = this._tokenizationService.verifyAccessToken(token)


        return of(!!result && result.payload['type'] === 'stage').pipe(
            tap(isValid => {
                if(isValid) {
                    return from(this._stageRepository.update(result.payload['stageId'], {lastActivity: new Date()}))
                }
            }),
        )
    }
}

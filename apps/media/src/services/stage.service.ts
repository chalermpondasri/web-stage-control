import { AccessTokenDto } from '@libs/common/models/common/token.dto';
import { StageRegisterRequest } from '@libs/common/models/community/stage-register.request';
import {
    from,
    map,
    mergeMap,
    Observable,
    throwError,
} from 'rxjs'
import { IStageService } from './interfaces/service.interface'
import { Repository } from 'typeorm'
import { Stage } from '@libs/entities/stage.entity'
import { UnauthorizedException } from '@nestjs/common'
import { ITokenizationService } from '@libs/providers/tokenization/tokenization-service.interface'
import { plainToInstance } from 'class-transformer'

export class StageService implements IStageService {
    public constructor(
        private readonly _stageRepository: Repository<Stage>,
        private readonly _tokenizationService: ITokenizationService,
    ) {
    }
    public registerStage(request: StageRegisterRequest): Observable<AccessTokenDto> {
        return from(this._stageRepository.findOneBy({
            communityId: request.communityId,
            authorizationCode: request.authorizationCode
        })).pipe(
            mergeMap(result => {
                if(!result) {
                    return throwError(() => new UnauthorizedException())
                }

                result.lastActivity = new Date()
                result.location = request.location

                const payload = {
                    type: 'stage',
                    communityId: request.communityId,
                    stageId: result.id,
                    startDate: result.community.startDate,
                    endDate: result.community.endDate,
                }

                return from(this._stageRepository.save(result)).pipe(
                    map(() => payload)
                )

            }),
            map(payload => {
                return plainToInstance(AccessTokenDto, {
                    accessToken: this._tokenizationService.createAccessToken(payload, {lifetime: true})
                })
            })
        )
    }

}
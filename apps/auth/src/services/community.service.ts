import { CommunityDto } from '@libs/common/models/community/community.dto';
import { ICommunityService } from './interfaces/community-service.interface'
import { Repository } from 'typeorm'
import { Community } from '@libs/entities/community.entity'
import {
    catchError,
    from,
    map,
    mergeMap,
    Observable,
    of,
    throwError,
} from 'rxjs'
import {
    BadRequestException,
    Logger,
} from '@nestjs/common'
import { ErrorEnum } from '@libs/common/constants/error.enum'
import dayjs from 'dayjs'
import { plainToInstance } from 'class-transformer'

export class CommunityService implements ICommunityService {
    private readonly _logger: Logger = new Logger(CommunityService.name)
    public constructor(
        private readonly _communityRepository: Repository<Community>
    ) {
    }
    public getCommunityId(communityId: string): Observable<CommunityDto> {
        return of(communityId).pipe(
            mergeMap(communityId => {
                if(!communityId) {
                    return throwError(() => new BadRequestException(ErrorEnum.COMMUNITY_NOT_FOUND))
                }

                return from(this._communityRepository.findOneBy({id: communityId})).pipe(
                    catchError((err) => throwError(() => {
                        this._logger.error(err)
                        return new BadRequestException(ErrorEnum.COMMUNITY_NOT_FOUND)
                    }))
                )
            }),
            map(community => {
                const communityDto: CommunityDto = {
                    id: community.id,
                    name: community.name,
                    coverImage: community.coverImage,
                    startDate: community.startDate,
                    endDate: community.endDate,
                    isFinished: !community.endDate? false : dayjs().isAfter(community.endDate)
                }

                return plainToInstance(CommunityDto, communityDto)
            })
        )
    }

}
import { IRankingService } from './interfaces/ranking-service.interface'
import {
    forkJoin,
    mergeMap,
    Observable,
    of,
    throwError,
} from 'rxjs'
import {
    Between,
    Repository,
} from 'typeorm'
import dayjs from 'dayjs'
import { CoinDeduction } from '@libs/entities/coin-deduction.entity'
import {
    BoostRankingDto,
    UserRankingDto,
} from '@libs/common/models/ranking/boost-ranking.dto'
import { plainToInstance } from 'class-transformer'
import _ from 'lodash'
import { ONE_HOUR_IN_MS } from '@libs/common/constants/common.constant'
import { Community } from '@libs/entities/community.entity'
import { BadRequestException } from '@nestjs/common'
import { ErrorEnum } from '@libs/common/constants/error.enum'

export class RankingService implements IRankingService {

    public constructor(
        private readonly _coinDeductionRepository: Repository<CoinDeduction>,
        private readonly _communityRepository: Repository<Community>,
    ) {
    }

    public getCommunityBoostRanking(communityId: string): Observable<BoostRankingDto> {

        const today = dayjs()
        const startOfWeek = today.startOf('week')

        let yesterday = today.subtract(1, 'day').endOf('day')

        if (yesterday.isBefore(startOfWeek)) {
            yesterday = startOfWeek.endOf('day')
        }

        const query = this._coinDeductionRepository.createQueryBuilder('cd')
            .cache(ONE_HOUR_IN_MS)
            .select('cd.userId')
            .addSelect('SUM(cd.deductedCoin)', 'sum')
            .innerJoinAndSelect('cd.user', 'user')
            .where({
                communityId,
                createdAt: Between(startOfWeek.toDate(), yesterday.toDate()),
            })
            .groupBy('cd.userId, user.id')
            .orderBy('sum', 'DESC')

        const markName = (input: string): string => {
            if (input.length < 4) {
                return _.repeat('*', input.length)
            }

            return `${input.slice(0, 2)}${_.repeat('*', input.length - 3)}${input.slice(-1)}`

        }

        return forkJoin([
            this._communityRepository.findOneBy({ id: communityId }),
            query.getRawMany(),
        ]).pipe(
            mergeMap(([community, result]) => {
                if (!community) {
                    return throwError(() => new BadRequestException(ErrorEnum.COMMUNITY_NOT_FOUND))
                }
                const ranking = result.map(v => {
                    const { user_id, user_name, user_setting, user_picture, sum } = v
                    return plainToInstance(UserRankingDto, {
                        id: user_id,
                        name: user_setting?.showName ? user_name : markName(user_name),
                        avatar: user_setting?.showProfile ? user_picture : null,
                        coinSpent: Number(sum),
                    })
                })
                return of(plainToInstance(BoostRankingDto, {
                    startDate: startOfWeek.toDate(),
                    endDate: yesterday.toDate(),
                    location: community.name,
                    ranking,
                }))

            }),
        )
    }
}
import {
    Controller,
    Get,
    Inject,
    Param,
} from '@nestjs/common'
import { RankingService } from '../services/ranking.service'
import { ProviderName } from '@libs/common/constants'
import {
    ApiOperation,
    ApiResponse,
} from '@nestjs/swagger'
import { BoostRankingDto } from '@libs/common/models/ranking/boost-ranking.dto'

@Controller('/ranking')
export class RankingController {
    public constructor(
        @Inject(ProviderName.RANKING_SERVICE)
        private readonly _rankingService: RankingService,
    ) {
    }

    @ApiOperation({
        description: 'get weekly spender from starting of week until yesterday',
        parameters: [
            {
                name: 'communityId',
                description: 'community id as uuid',
                in:'query'
            }
        ],
    })
    @ApiResponse({type: BoostRankingDto})

    @Get('/weekly-spender/:communityId')
    public getWeeklySpender(
        @Param('communityId') communityId: string,
    ) {
        return this._rankingService.getCommunityBoostRanking(communityId)
    }
}
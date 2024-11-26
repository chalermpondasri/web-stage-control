import {
    Controller,
    Get,
    Inject,
    Param,
} from '@nestjs/common'
import { ICommunityService } from '../services/interfaces/community-service.interface'
import { ProviderName } from '@libs/common/constants'
import {
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import { CommunityDto } from '@libs/common/models/community/community.dto'

@ApiTags(...['community'])
@Controller('/community')
export class CommunityController {
    public constructor(
        @Inject(ProviderName.COMMUNITY_SERVICE)
        private readonly _communityService: ICommunityService,
    ) {
    }

    @ApiOperation({ description: 'Get community detail by id' })
    @ApiResponse({type: CommunityDto})
    @Get('/:communityId')
    getCommunity(
        @Param('communityId') communityId: string,
    ) {
        return this._communityService.getCommunityId(communityId)
    }

}
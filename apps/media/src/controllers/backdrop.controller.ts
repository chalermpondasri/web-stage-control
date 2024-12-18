import {
    Controller,
    Get,
    Inject,
    Query,
    UseGuards,
} from '@nestjs/common'
import { IBackdropService } from '../services/interfaces/service.interface'
import { ProviderName } from '@libs/common/constants'
import {
    ApiBearerAuth,
    ApiOperation,
    ApiQuery,
    ApiResponse,
} from '@nestjs/swagger'
import { BackdropDto } from '@libs/common/models/media/backdrop.dto'
import { StageGuard } from '@libs/guards/stage.guard'

@Controller('/backdrops')
export class BackdropController {
    public constructor(
        @Inject(ProviderName.BACKDROP_SERVICE)
        private readonly _backdropService: IBackdropService,
    ) {
    }

    @ApiOperation({description: 'get backdrops'})
    @ApiQuery({name: 'communityId', type: 'uuid', description: 'community uuid'})
    @ApiResponse({
        type: [BackdropDto]
    })
    @ApiBearerAuth()
    @UseGuards(StageGuard)
    @Get('/')
    public getByCommunityId(
        @Query('communityId') communityId: string) {
        return this._backdropService.getByCommunityId(communityId)
    }
}
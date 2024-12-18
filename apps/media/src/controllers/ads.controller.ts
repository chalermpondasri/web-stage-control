import {
    Controller,
    Get,
    Inject,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common'
import { ProviderName } from '@libs/common/constants'
import { IAdsService } from '../services/interfaces/service.interface'
import {
    ApiBearerAuth,
    ApiOperation,
    ApiQuery,
    ApiResponse,
} from '@nestjs/swagger'
import { AdvertisementDto } from '@libs/common/models/media/advertisement.dto'
import { StageGuard } from '@libs/guards/stage.guard'

@Controller('/ads')
export class AdsController {
    public constructor(
        @Inject(ProviderName.ADS_SERVICE)
        private readonly _adsService: IAdsService,
    ) {
    }

    @ApiBearerAuth()
    @ApiOperation({description: 'get ads configuration'})
    @ApiQuery({name: 'communityId', type: 'uuid', description: 'community uuid'})
    @ApiResponse({type: [AdvertisementDto]})
    @UseGuards(StageGuard)
    @Get('/')
    public getAds(
        @Query('communityId') communityId: string,
    ) {
        return this._adsService.getAds({communityId})
    }

    @Get('/:id')
    public getAdsDetail(
        @Param('id') id: string,
    ) {

        return this._adsService.getAdsDetail(Number(id))
    }

}
import {
    Controller,
    Get,
    Inject,
    Param,
} from '@nestjs/common'
import { ProviderName } from '@libs/common/constants'
import { IAdsService } from '../services/interfaces/service.interface'

@Controller('/ads')
export class AdsController {
    public constructor(
        @Inject(ProviderName.ADS_SERVICE)
        private readonly _adsService: IAdsService,
    ) {
    }


    @Get('/x')
    public getAds() {
        return this._adsService.getAds({communityId: '0193aa64322d7d17991ccf6a0eaa13df'})
    }

    @Get('/:id')
    public getAdsDetail(
        @Param('id') id: string,
    ) {

        return this._adsService.getAdsDetail(Number(id))
    }

}
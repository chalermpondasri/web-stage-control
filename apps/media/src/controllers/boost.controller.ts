import {
    Body,
    Controller,
    Inject,
    Post,
    UseGuards,
} from '@nestjs/common'
import { BoostRequest } from '@libs/common/models/media/boost.request'
import { BoostService } from '../services/boost.service'
import { ProviderName } from '@libs/common/constants'
import { GenericUserGuard } from '@libs/guards/generic-user.guard'
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'

@ApiTags('media')
@Controller('/boost')
export class BoostController {
    public constructor(
        @Inject(ProviderName.BOOST_SERVICE)
        private readonly _boostService: BoostService,
    ) {
    }

    @ApiBearerAuth(GenericUserGuard.name)
    @ApiOperation({description:'boost select track with user coin'})
    @ApiBody({
        type: BoostRequest,
    })
    @ApiResponse({example: {success: true}})
    @UseGuards(GenericUserGuard)
    @Post('/')
    public boostMedia(
        @Body() request: BoostRequest
    ) {
        return this._boostService.boostMedia(request)
    }



}

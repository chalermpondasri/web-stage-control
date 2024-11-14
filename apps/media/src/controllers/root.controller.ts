import {
    Controller,
    Get,
    Inject,
    Param,
    UseGuards,
} from '@nestjs/common'
import { IMediaService } from '../services/interfaces/service.interface'
import { StageGuard } from '@libs/guards/stage.guard'
import {
    ApiOperation,
    ApiParam,
} from '@nestjs/swagger'
import { ProviderName } from '@libs/common/constants'

@Controller('/')
export class RootController {
    public constructor(
        @Inject(ProviderName.MEDIA_SERVICE,)
        private readonly _mediaService: IMediaService
    ) {
    }


    @ApiOperation({description: 'get media detail'})
    @ApiParam({name:'mediaId', type:'number', description: 'media id'})
    @UseGuards(StageGuard)
    @Get('/:mediaId')
    public getMediaDetail(
        @Param('mediaId') mediaId: string,
    ): any {
        return this._mediaService.getMediaDetail(mediaId)
    }
}
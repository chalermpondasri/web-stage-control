import {
    Body,
    Controller,
    Get,
    Inject,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common'
import { ProviderName } from '@libs/common/constants'
import {
    IBoostService,
    IPlaylistService,
    IStageService,
} from '../services/interfaces/service.interface'
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import { PlayingTrackDto } from '@libs/common/models/media/playing-track.dto'
import { PlaylistDto } from '@libs/common/models/media/playlist.dto'
import { StageRegisterRequest } from '@libs/common/models/community/stage-register.request'
import { AccessTokenDto } from '@libs/common/models/common/token.dto'
import { StageGuard } from '@libs/guards/stage.guard'
import {
    MediaPauseRequest,
    MediaPlayRequest,
} from '@libs/common/models/media/media-play.request'
import { GenericUserGuard } from '@libs/guards/generic-user.guard'
import { BoostRequest } from '@libs/common/models/media/boost.request'
import { AddToQueueRequest } from '@libs/common/models/media/add-to-queue.request'
import { StageLoggingRequest } from '@libs/common/models/media/stage-logging.request'

@ApiTags(...['community'])
@Controller('/communities')
export class CommunityController {

    public constructor(
        @Inject(ProviderName.PLAYLIST_SERVICE)
        private readonly _playlistService: IPlaylistService,
        @Inject(ProviderName.STAGE_SERVICE)
        private readonly _stageService: IStageService,
        @Inject(ProviderName.BOOST_SERVICE)
        private readonly _boostService: IBoostService,
    ) {
    }

    @ApiOperation({description:'get current playing on the community' })
    @ApiResponse({
        type: PlayingTrackDto,
        description: 'Current playing on community or null if nothing is playing',
    })

    @Get('/:communityId/playing')
    public getNowPlaying(
        @Param('communityId') communityId: string,
    ) {
        return this._playlistService.getNowPlaying(communityId)
    }

    @ApiOperation({description:'get playlist' })
    @ApiResponse({
        type: PlaylistDto,
    })
    @Get('/:communityId/playlist')
    public getPlaylist(
        @Param('communityId') communityId: string,
    ) {

        return this._playlistService.getPlaylist(communityId)
    }


    @ApiOperation({description:'register stage device using authorization code' })
    @ApiBody({
        type: StageRegisterRequest,
    })
    @ApiResponse({
        type: AccessTokenDto,
    })
    @Post('/register')
    public registerStage(
        @Body() body: StageRegisterRequest
    ) {
        return this._stageService.registerStage(body)
    }


    @ApiOperation({description:'play media control' })
    @ApiBody({type: MediaPlayRequest})
    @ApiParam({name: 'communityId', description: 'community id', type: 'uuid'})
    @ApiParam({name: 'id', description: 'media id', type: 'number'})
    @UseGuards(StageGuard)
    @Post('/:communityId/play/:id')
    public playMedia(
        @Param('communityId') communityId: string,
        @Param('id') id: string,
        @Body() request: MediaPlayRequest,
    ){
        return this._stageService.play(communityId, id, request)
    }

    @ApiOperation({description:'pause media control' })
    @ApiBody({type: MediaPauseRequest})
    @ApiParam({name: 'communityId', description: 'community id', type: 'uuid'})
    @ApiParam({name: 'id', description: 'media id', type: 'number'})
    @UseGuards(StageGuard)
    @Post('/:communityId/pause/:id')
    public pauseMedia(
        @Param('communityId') communityId: string,
        @Param('id') id: string,
        @Body() request: MediaPauseRequest,
    ){
        return this._stageService.pause(communityId, id, request)
    }

    @ApiTags('media')
    @ApiBearerAuth(GenericUserGuard.name)
    @ApiOperation({description:'boost select track with user coin'})
    @ApiBody({
        type: BoostRequest,
    })
    @ApiResponse({example: {success: true}})
    @UseGuards(GenericUserGuard)
    @Post('/:communityId/boost')
    public boostMedia(
        @Param('communityId')communityId: string,
        @Body() request: BoostRequest
    ) {
        return this._boostService.boostMedia(communityId,request)
    }

    @ApiTags('media')
    @ApiBearerAuth(GenericUserGuard.name)
    @ApiOperation({description:'add new select track with user coin'})
    @ApiBody({
        type: AddToQueueRequest,
    })
    @ApiResponse({example: {success: true}})
    @UseGuards(GenericUserGuard)
    @Post('/:communityId/add')
    public addMedia(
        @Param('communityId')communityId: string,
        @Body() request: AddToQueueRequest
    ) {
        return this._boostService.addToQueue(communityId, request)
    }

    @ApiOperation({description: 'logging to discord' })
    @ApiBody({type: StageLoggingRequest})
    @UseGuards(StageGuard)
    @Post('/:communityId/logging')
    public logStageError(
        @Body() body: StageLoggingRequest
    ) {
        return this._stageService.loggingMessage(body)
    }
}

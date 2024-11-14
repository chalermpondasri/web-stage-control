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
    IPlaylistService,
    IStageService,
} from '../services/interfaces/service.interface'
import {
    ApiBody,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import { PlayingTrackDto } from '@libs/common/models/media/playing-track.dto'
import { PlaylistDto } from '@libs/common/models/media/playlist.dto'
import { StageRegisterRequest } from '@libs/common/models/community/stage-register.request'
import { AccessTokenDto } from '@libs/common/models/common/token.dto'
import { StageGuard } from '@libs/guards/stage.guard'

@ApiTags(...['community'])
@Controller('/communities')
export class CommunityController {

    public constructor(
        @Inject(ProviderName.PLAYLIST_SERVICE)
        private readonly _playlistService: IPlaylistService,
        @Inject(ProviderName.STAGE_SERVICE)
        private readonly _stageService: IStageService,
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
    @UseGuards(StageGuard)
    @Post('/:communityId/play/:id')
    public playMedia(
        @Param('communityId') communityId: string,
        @Param('id') id: string,
    ){

    }

    @UseGuards(StageGuard)
    @Post('/:communityId/pause/:id')
    public pauseMedia(
        @Param('communityId') communityId: string,
        @Param('id') id: string,
    ){

    }


}
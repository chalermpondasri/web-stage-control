import {
    Body,
    Controller,
    Inject,
    Param,
    Post,
    Put,
    Sse,
    UseGuards,
} from '@nestjs/common'
import { ProviderName } from '@libs/common/constants'
import {
    ApiBearerAuth,
    ApiExtraModels,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import { TrackBoostedSse } from '@libs/common/models/media/sse/track-boosted.sse'
import { EventSubjectFactory } from '@libs/providers/event-subject.provider'
import { IStageService } from '../services/interfaces/service.interface'
import { StageGuard } from '@libs/guards/stage.guard'
import { ProgressUpdateRequest } from '@libs/common/models/community/progress-update.request'
import { SuccessDto } from '@libs/common/models/common/success.dto'
import { PlaybackPlaySse } from '@libs/common/models/media/sse/playback-play.sse'

@Controller('/playlist')
export class PlaylistController {
    @Inject(ProviderName.SSE_PLAYLIST_SUBJECT_FACTORY)
    private readonly _eventSubjectFactory: EventSubjectFactory
    @Inject(ProviderName.STAGE_SERVICE)
    private readonly _stageService: IStageService

    @ApiTags(...['sse'])
    @ApiOperation({ description: 'SSE endpoint to subscribe to playlist update event' })
    @ApiParam({ name: 'communityId', description: 'UUID of community to subscribe to', type: 'uuid' })
    @ApiExtraModels(...[TrackBoostedSse])
    @Sse('/:communityId')
    public subscribePlaylistEventSubject(
        @Param('communityId') communityId: string,
    ) {
        return this._eventSubjectFactory.getSubject(communityId)
    }

    @ApiTags(...['stage control'])
    @ApiBearerAuth()
    @ApiOperation({ description: 'notify freeze playlist for any boost changes' })
    @UseGuards(StageGuard)
    @Post('/:communityId/freeze')
    public freezePlaylist(
        @Param('communityId') communityId: string,
    ) {
        return this._stageService.freeze(communityId)
    }

    @ApiTags(...['stage control'])
    @ApiBearerAuth()
    @UseGuards(StageGuard)
    @ApiOperation({ description: 'notify unfreeze and accept boost' })
    @Post('/:communityId/unfreeze')
    public unfreezePlaylist(
        @Param('communityId') communityId: string,
    ) {
        return this._stageService.freeze(communityId)
    }

    @ApiTags(...['stage control'])
    @ApiBearerAuth()
    @UseGuards(StageGuard)
    @ApiOperation({ description: 'update track progress, this method produce `TRACK_PROGRESS_UPDATE` with PlaybackPlaySse model' })
    @ApiResponse({ type: SuccessDto })
    @ApiExtraModels(PlaybackPlaySse)
    @Put('/:communityId/progress')
    public progressUpdate(
        @Param('communityId') communityId: string,
        @Body() progressUpdateRequest: ProgressUpdateRequest,
    ) {
        return this._stageService.progressUpdate(communityId, progressUpdateRequest)
    }
}
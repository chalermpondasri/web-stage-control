import {
    Controller,
    Inject,
    Param,
    Sse,
} from '@nestjs/common'
import { ProviderName } from '@libs/common/constants'
import {
    ApiExtraModels,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger'
import { TrackBoostedSse } from '@libs/common/models/media/sse/track-boosted.sse'
import { EventSubjectFactory } from '@libs/providers/event-subject.provider'


@Controller('/playlist')
export class PlaylistController {
    @Inject(ProviderName.SSE_PLAYLIST_SUBJECT_FACTORY)
    private readonly _eventSubjectFactory: EventSubjectFactory

    @ApiTags(...['sse'])
    @ApiOperation({description:'SSE endpoint to subscribe to playlist update event'})
    @ApiParam({name: 'communityId', description: 'UUID of community to subscribe to', type: 'uuid'})
    @ApiExtraModels(...[TrackBoostedSse])
    @Sse('/:communityId')
    public subscribePlaylistEventSubject(
        @Param('communityId') communityId: string,
    ) {
        return this._eventSubjectFactory.getSubject(communityId)
    }
}
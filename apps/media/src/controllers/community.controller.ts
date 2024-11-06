import {
    Controller,
    Get,
    Inject,
    Param,
} from '@nestjs/common'
import { ProviderName } from '@libs/common/constants'
import { IPlaylistService } from '../services/interfaces/service.interface'
import {
    ApiOperation,
    ApiResponse,
} from '@nestjs/swagger'
import { PlayingTrackDto } from '@libs/common/models/media/playing-track.dto'
import { PlaylistDto } from '@libs/common/models/media/playlist.dto'

@Controller('/communities')
export class CommunityController {

    public constructor(
        @Inject(ProviderName.PLAYLIST_SERVICE)
        private readonly _playlistService: IPlaylistService
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


}
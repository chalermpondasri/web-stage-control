import { Observable } from 'rxjs'
import { PlaylistDto } from '@libs/common/models/media/playlist.dto'
import { PlayingTrackDto } from '@libs/common/models/media/playing-track.dto'
import { BoostRequest } from '@libs/common/models/media/boost.request'
import { StageRegisterRequest } from '@libs/common/models/community/stage-register.request'
import { AccessTokenDto } from '@libs/common/models/common/token.dto'

export interface IPlaylistService {
    getPlaylist(communityId: string): Observable<PlaylistDto>
    getNowPlaying(communityId: string): Observable<PlayingTrackDto>
}

export interface IBoostService {
    boostMedia(request: BoostRequest):Observable<any>
}

export interface IStageService {
    registerStage(request: StageRegisterRequest): Observable<AccessTokenDto>
}
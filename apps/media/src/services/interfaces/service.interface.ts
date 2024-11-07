import { Observable } from 'rxjs'
import { PlaylistDto } from '@libs/common/models/media/playlist.dto'
import { PlayingTrackDto } from '@libs/common/models/media/playing-track.dto'
import { BoostRequest } from '@libs/common/models/media/boost.request'

export interface IPlaylistService {
    getPlaylist(communityId: string): Observable<PlaylistDto>
    getNowPlaying(communityId: string): Observable<PlayingTrackDto>
}

export interface IBoostService {
    boostMedia(request: BoostRequest):Observable<any>
}
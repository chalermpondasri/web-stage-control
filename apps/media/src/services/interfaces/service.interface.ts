import { Observable } from 'rxjs'
import { PlaylistDto } from '@libs/common/models/media/playlist.dto'
import { PlayingTrackDto } from '@libs/common/models/media/playing-track.dto'

export interface IPlaylistService {
    getPlaylist(communityId: string): Observable<PlaylistDto>
    getNowPlaying(communityId: string): Observable<PlayingTrackDto>
}
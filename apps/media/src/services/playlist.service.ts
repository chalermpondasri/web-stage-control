import { Observable } from 'rxjs'
import { PlayingTrackDto } from '@libs/common/models/media/playing-track.dto'
import { PlaylistDto } from '@libs/common/models/media/playlist.dto'
import { Repository } from 'typeorm'
import { Community } from '@libs/entities/community.entity'
import { IPlaylistService } from './interfaces/service.interface'

export class PlaylistService implements IPlaylistService {
    public constructor(
        private readonly _communityRepository: Repository<Community>
    ) {
    }

    public getPlaylist(communityId: string): Observable<PlaylistDto> {
        throw new Error('Method not implemented.')
    }

    public getNowPlaying(communityId: string): Observable<PlayingTrackDto> {
        throw new Error('Method not implemented.')
    }
}
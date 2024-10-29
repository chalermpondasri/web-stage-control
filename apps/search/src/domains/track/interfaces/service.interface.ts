import { ListResponse } from '@libs/common/models'
import { Observable } from 'rxjs'
import { AlbumSearchDto } from '../../album/dtos/album.dto'
import { ArtistSearchDto } from '../../artist/dtos/artist.dto'
import { TrackSearchDto } from '../dtos/track.dto'

export interface ITrackService {
    searchTracksByKeyword(
        keyword: string,
        page?: number,
        limit?: number,
    ): Observable<ListResponse<TrackSearchDto | ArtistSearchDto | AlbumSearchDto>>
}

import { ListResponse } from '@libs/common/models'
import { Observable } from 'rxjs'
import { AlbumDto } from '../dtos/album.dto'
import { ArtistDto } from '../dtos/artist.dto'
import { TrackDto } from '../dtos/track.dto'
import { SearchSuggestionResponse } from './search-all.interface'

export interface ITrackService {
    searchTracksByKeyword(
        keyword: string,
        page?: number,
        limit?: number,
    ): Observable<ListResponse<TrackDto | ArtistDto | AlbumDto>>
    getSuggestion(keyword: String): Observable<ListResponse<SearchSuggestionResponse>>
}

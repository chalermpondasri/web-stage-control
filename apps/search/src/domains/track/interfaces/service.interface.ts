import { ListResponse } from '@libs/common/models'
import { Observable } from 'rxjs'
import { AlbumSearchDto } from '../dtos/album.dto'
import { ArtistSearchDto } from '../dtos/artist.dto'
import { TrackSearchDto } from '../dtos/track.dto'
import { SearchSuggestionResponse } from './search-all.interface'

export interface ITrackService {
    searchTracksByKeyword(
        keyword: string,
        page?: number,
        limit?: number,
    ): Observable<ListResponse<TrackSearchDto | ArtistSearchDto | AlbumSearchDto>>
    getSuggestion(keyword: String): Observable<ListResponse<SearchSuggestionResponse>>
}

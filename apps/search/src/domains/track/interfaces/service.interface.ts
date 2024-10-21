import { ListResponse } from '@libs/common/models'
import { Observable } from 'rxjs'
import { TrackDto } from '../dtos/track.dto'
import { SearchSuggestionResponse } from './search-all.interface'

export interface ITrackService {
    searchTrackByKeyword(keyword: string, page?: number, limit?: number): Observable<ListResponse<TrackDto>>
    getSuggestion(keyword: String): Observable<ListResponse<SearchSuggestionResponse>>
}

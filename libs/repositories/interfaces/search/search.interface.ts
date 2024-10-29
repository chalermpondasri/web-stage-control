import { GetResponse, SearchResponse, Sort } from '@elastic/elasticsearch/lib/api/types'
import { Observable } from 'rxjs'
import { AlbumES } from './album.interface'
import { ArtistES } from './artist.interface'
import { TrackES } from './track.interface'

export type fuzziness = 0 | 1 | 2 | 'AUTO'

export interface ISearchOptions {
    fuzziness?: fuzziness
    boost?: number
    page?: number
    limit?: number
    sort?: Sort
}

export interface IDocumentIndexOptions {
    id?: string
    pipeline?: string
}

export interface ISearchRepository {
    getDocument(index: string, id: string): Observable<GetResponse<any>>
    getDocuments(index: string): Observable<SearchResponse>
    indexDocument(index: string, document: Record<string, any>, opts?: IDocumentIndexOptions): Observable<any>
    fuzzySearchDocument(index: string, text: string, fields: string[], opts: ISearchOptions): Observable<SearchResponse>
    searchDocument(index: string, fields: Record<string, any>): Observable<SearchResponse<any>>
    getRelatedData(searchResponse: SearchResponse<TrackES | AlbumES | ArtistES>): Observable<RelatedData>
}

export interface GenericAggResponse {
    aggregations: {
        result: {
            buckets: Array<{
                key: string
                doc_count: number
                top_hits: {
                    hits: {
                        hits: Array<{
                            _source: Record<string, any>
                        }>
                    }
                }
            }>
        }
    }
}

export interface TopHitsBucket {
    key: string
    doc_count: number
    top_hits: {
        hits: {
            hits: Array<{
                _source: Record<string, any>
            }>
        }
    }
}

export interface TopHitsAggregationResponse {
    aggregations: {
        result: {
            buckets: TopHitsBucket[]
        }
    }
}

export interface RelatedData {
    tracks: TrackES[]
    artists: ArtistES[]
    albums: AlbumES[]
}

import { GetResponse, SearchResponse } from '@elastic/elasticsearch/lib/api/types'
// import { MediaContentModel } from '@libs/common/models/media/media-content.model'
import { Observable } from 'rxjs'

export type fuzziness = 0 | 1 | 2 | 'AUTO'

export interface ISearchOptions {
    fuzziness?: fuzziness
    boost?: number
    page?: number
    limit?: number
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
    // genericSearchDocument(
    //     index: string,
    //     text: string,
    //     fields: string[],
    //     opts: ISearchOptions,
    // ): Observable<SearchResponse>
}

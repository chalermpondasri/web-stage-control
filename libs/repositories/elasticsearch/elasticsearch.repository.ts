import { Client } from '@elastic/elasticsearch'
import { GetResponse, SearchResponse } from '@elastic/elasticsearch/lib/api/types'
import {
    IDocumentIndexOptions,
    ISearchOptions,
    ISearchRepository,
} from '@libs/repositories/interfaces/search/search.interface'
import { Observable, from } from 'rxjs'

export class ElasticsearchRepository implements ISearchRepository {
    public constructor(private readonly _client: Client) {}

    public getDocument(index: string, id: string): Observable<GetResponse<any>> {
        const promise = this._client.get({
            index,
            id,
        })
        return from(promise)
    }

    public getDocuments(index: string): Observable<SearchResponse> {
        const promise = this._client.search({
            index,
            sort: { _doc: { order: 'desc' } },
        })
        return from(promise)
    }

    public indexDocument(
        index: string,
        document: Record<string, any>,
        opts: IDocumentIndexOptions = {},
    ): Observable<any> {
        const promise = this._client.index({
            index,
            document,
            ...opts,
        })

        return from(promise)
    }

    public fuzzySearchDocument(
        index: string,
        text: string,
        fields: string[],
        opts: ISearchOptions,
    ): Observable<SearchResponse> {
        const queryStringQuery = text
            .split(' ')
            .map((v) => `*${v}*`)
            .join(' OR ')
        const mustQuery = []

        const promise = this._client.search({
            index,
            from: (opts.page - 1) * 20,
            size: 20,
            query: {
                bool: {
                    minimum_should_match: 1,
                    should: [
                        {
                            query_string: {
                                fields,
                                query: queryStringQuery,
                            },
                        },
                        {
                            multi_match: {
                                query: text,
                                fields,
                                fuzziness: opts.fuzziness || 2,
                                ...(!!opts.boost && { boost: opts.boost }),
                            },
                        },
                    ],
                    must: mustQuery,
                },
            },
        })
        return from(promise)
    }
}

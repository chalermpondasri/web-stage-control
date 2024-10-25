import { Client } from '@elastic/elasticsearch'
import { GetResponse, SearchResponse } from '@elastic/elasticsearch/lib/api/types'
import {
    IDocumentIndexOptions,
    ISearchOptions,
    ISearchRepository,
} from '@libs/repositories/interfaces/search/search.interface'
import { Logger } from '@nestjs/common'
import { Observable, from } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { TrackES } from '../interfaces/search/track.interface'

export abstract class ElasticsearchRepository implements ISearchRepository {
    private readonly _logger: Logger = new Logger(ElasticsearchRepository.name)
    public constructor(private readonly _client: Client) {}

    public getDocument(index: string, id: string): Observable<GetResponse<any>> {
        const promise = this._client.get({
            index,
            id,
        })
        return from(promise).pipe(
            catchError((err) => {
                this._logger.error(`Error getting document: ${err}`)
                throw err
            }),
        )
    }

    public getDocuments(index: string): Observable<SearchResponse> {
        const promise = this._client.search({
            index,
            sort: { _doc: { order: 'desc' } },
        })
        return from(promise).pipe(
            catchError((err) => {
                this._logger.error(`Error getting documents: ${err}`)
                throw err
            }),
        )
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

        return from(promise).pipe(
            catchError((err) => {
                this._logger.error(`Error indexing document: ${err}`)
                throw err
            }),
        )
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

        let size = 20
        if (opts.limit) {
            size = opts.limit
        }

        const promise = this._client.search({
            index,
            from: (opts.page - 1) * size,
            size,
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
        return from(promise).pipe(
            catchError((err) => {
                this._logger.error(`Error in fuzzy search: ${err}`)
                throw err
            }),
        )
    }

    public genericSearchDocument(
        index: string,
        text: string,
        fields: string[],
        opts?: ISearchOptions,
    ): Observable<SearchResponse<TrackES>> {
        // validate text
        if (!text) {
            return new Observable((observer) => {
                observer.error('Text is required')
            })
        }
        // validate index
        if (!index) {
            return new Observable((observer) => {
                observer.error('Index is required')
            })
        }
        // validate fields
        if (!fields || fields.length === 0) {
            return new Observable((observer) => {
                observer.error('Fields is required')
            })
        }

        // set default options
        if (!opts) {
            opts = {
                page: 1,
                limit: 20,
            }
        }

        // text ที่มากกว่า 1 ตัวอักษร จะสนใจใช้อีกแบบ (ไม่ใช้ wildcard)
        if (text.length > 1) {
            return this.multipleCharacterSearch(index, text, fields, opts)
        }

        // text ที่มีเพียง 1 ตัวอักษร จะใช้ singleCharacterSearch
        if (text.length === 1) {
            return this.singleCharacterSearch(index, text, fields, opts)
        }
    }

    /**
     * Used when search suggestion is more than one character
     * @param index index name
     * @param text keyword to search
     * @param fields fields to search
     * @param opts search options
     * @returns
     */
    public multipleCharacterSearch(
        index: string,
        text: string,
        fields: string[],
        opts?: ISearchOptions,
    ): Observable<SearchResponse<TrackES>> {
        let pagination = {}
        if (opts && opts.page && opts.limit) {
            pagination = {
                from: (opts.page - 1) * opts.limit,
                size: opts.limit,
            }
        }

        this._logger.log(`Searching for ${text} in ${fields.join(', ')}`)
        const promise: Promise<SearchResponse<TrackES>> = this._client.search({
            index,
            body: {
                query: {
                    dis_max: {
                        queries: fields.map((field) => ({
                            match: {
                                [field]: {
                                    query: text,
                                    fuzziness: 'AUTO',
                                    boost: 1.0,
                                    _name: field.replace('.', '_'),
                                },
                            },
                        })),
                        tie_breaker: 0.3, // Optional: to slightly consider other fields
                    },
                },
                ...pagination,
                highlight: {
                    fields: fields.reduce(
                        (acc, field) => {
                            acc[field] = {} // Add highlighting for each field
                            return acc
                        },
                        {} as Record<string, {}>,
                    ),
                    pre_tags: [
                        '<strong>',
                    ], // Customize pre and post tags for highlighting
                    post_tags: [
                        '</strong>',
                    ],
                },
            },
        })

        return from(promise).pipe(
            catchError((err) => {
                this._logger.error(`Error in multiple character search: ${err}`)
                throw err
            }),
        )
    }

    /**
     * Used when search suggestion is a single character
     * @param index index name
     * @param text keyword to search
     * @param fields fields to search
     * @param opts search options
     * @returns
     */
    public singleCharacterSearch(
        index: string,
        text: string,
        fields: string[],
        opts?: ISearchOptions,
    ): Observable<SearchResponse<TrackES>> {
        let pagination = {}
        if (opts && opts.page && opts.limit) {
            pagination = {
                from: (opts.page - 1) * opts.limit,
                size: opts.limit,
            }
        }

        const promise: Promise<SearchResponse<TrackES>> = this._client.search({
            index,
            body: {
                query: {
                    bool: {
                        should: fields.map((field) => ({
                            wildcard: {
                                [field]: {
                                    value: `${text}*`,
                                    boost: 1.0,
                                    _name: `${field.replace('.', '_')}`, // Name for wildcard title query
                                },
                            },
                        })),
                        minimum_should_match: 1,
                    },
                },
                ...pagination,
                highlight: {
                    fields: fields.reduce(
                        (acc, field) => {
                            acc[field] = {} // Add highlighting for each field
                            return acc
                        },
                        {} as Record<string, {}>,
                    ),
                    pre_tags: [
                        '<strong>',
                    ], // Customize pre and post tags for highlighting
                    post_tags: [
                        '</strong>',
                    ],
                },
            },
        })

        return from(promise).pipe(
            catchError((err) => {
                this._logger.error(`Error in single character search: ${err}`)
                throw err
            }),
        )
    }

    /**
     * searh one document by fields
     * @param index index name
     * @param fields fields to search, for example { 'artist.id': 1 }
     * @returns
     */
    public searchDocument(index: string, fields: Record<string, any>): Observable<SearchResponse<any>> {
        const promise = this._client.search({
            index,
            body: {
                query: {
                    term: fields,
                },
                size: 1,
            },
        })
        return from(promise).pipe(
            catchError((err) => {
                this._logger.error(`Error getting document: ${err}`)
                throw err
            }),
        )
    }
}

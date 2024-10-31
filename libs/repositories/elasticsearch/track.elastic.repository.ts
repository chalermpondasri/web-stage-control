import { Client } from '@elastic/elasticsearch'
import { UpdateResponse, WriteResponseBase } from '@elastic/elasticsearch/lib/api/types'
import { SearchResponse } from '@elastic/elasticsearch/lib/api/typesWithBodyKey'
import { ElasticConstant } from '@libs/common/constants/elastic.constant'
import { Logger } from '@nestjs/common'
import { catchError, from, map, Observable, of, switchMap } from 'rxjs'
import { AlbumES } from '../interfaces/search/album.interface'
import { ArtistES } from '../interfaces/search/artist.interface'
import { ISearchOptions } from '../interfaces/search/search.interface'
import { TrackES } from '../interfaces/search/track.interface'
import { ElasticsearchRepository } from './elasticsearch.repository'

export class TrackElasticRepository extends ElasticsearchRepository {
    private readonly logger: Logger = new Logger(TrackElasticRepository.name)

    public constructor(private readonly client: Client) {
        super(client)
    }

    public addTrack(track: Partial<TrackES>): Observable<WriteResponseBase> {
        track.hitCounts = 0
        return this.indexDocument(ElasticConstant.INDICE.MUSIC, track)
    }

    public updateTrack(track: Partial<TrackES>): Observable<WriteResponseBase> {
        return from(
            this.client.search({
                index: ElasticConstant.INDICE.MUSIC,
                body: {
                    query: {
                        bool: {
                            must: [
                                { match: { id: track.id } },
                                { match: { type: 'track' } },
                            ],
                        },
                    },
                },
            }) as Promise<SearchResponse<TrackES>>,
        ).pipe(
            switchMap((response: SearchResponse<TrackES>) => {
                const id = response.hits.hits[0]?._id
                if (!id) {
                    track.hitCounts = 0
                    return this.addTrack(track as TrackES).pipe(
                        map((addResponse) => {
                            const newId = addResponse._id
                            this.logger.log(`Track added with ID: ${newId}`)
                            return {
                                _id: newId,
                                response,
                            }
                        }),
                        catchError((error) => {
                            this.logger.error(`Error adding track: ${error.message}`)
                            throw error
                        }),
                    )
                }
                this.logger.log(`Track found: ${id}`)
                return of({
                    _id: id,
                    response,
                })
            }),
            switchMap((data) => {
                console.log('Updating track: ' + data._id)
                track.hitCounts = data.response.hits.hits[0]._source.hitCounts || 0
                return from(
                    this.client
                        .update({
                            index: ElasticConstant.INDICE.MUSIC,
                            id: data._id.toString(),
                            body: {
                                doc: track,
                            },
                        })
                        .then((response: UpdateResponse<unknown>) => {
                            return response as WriteResponseBase
                        }),
                )
            }),
            catchError((error) => {
                this.logger.error(`Error updating track: ${error.message}`)
                throw error
            }),
        )
    }

    public deleteTrack(track: Partial<TrackES>): Observable<WriteResponseBase> {
        return from(
            this.client.search({
                index: ElasticConstant.INDICE.MUSIC,
                body: {
                    query: {
                        bool: {
                            must: [
                                { match: { id: track.id } },
                                { match: { type: 'track' } },
                            ],
                        },
                    },
                },
            }),
        ).pipe(
            map((response) => {
                const id = response.hits.hits[0]?._id
                if (!id) {
                    throw new Error('Track not found on elasticsearch')
                }
                this.logger.log(`Track found: ${id}`)
                return id
            }),
            switchMap((id) =>
                from(
                    this.client.delete({
                        index: ElasticConstant.INDICE.MUSIC,
                        id: id.toString(),
                    }),
                ),
            ),
            catchError((error) => {
                this.logger.error(`Error deleting track: ${error.message}`)
                throw error
            }),
        )
    }

    public search(
        keyword: string,
        fields?: string[],
        opts?: ISearchOptions,
    ): Observable<SearchResponse<TrackES | AlbumES | ArtistES>> {
        if (!opts) {
            opts = {}
            if (!opts.page) {
                opts.page = 1
            }

            if (!opts.limit) {
                opts.limit = 20
            }
        }

        if (!fields || (fields && fields.length === 0)) {
            fields = [
                'name_th',
                'name_en',
                'aliases',
            ]
        }

        return this.genericSearchDocument(ElasticConstant.INDICE.MUSIC, keyword, fields, opts)
    }

    public genericSearchDocument(
        index: string,
        text: string,
        fields: string[],
        opts?: ISearchOptions,
    ): Observable<SearchResponse<TrackES | ArtistES | AlbumES>> {
        if (!text) {
            return new Observable((observer) => {
                observer.error('Text is required')
            })
        }
        if (!index) {
            return new Observable((observer) => {
                observer.error('Index is required')
            })
        }
        if (!fields || fields.length === 0) {
            return new Observable((observer) => {
                observer.error('Fields is required')
            })
        }

        if (!opts) {
            opts = {
                page: 1,
                limit: 20,
            }
        }

        if (text.length > 2) {
            return this.multipleCharacterSearch(index, text, fields, opts)
        }

        if (text.length <= 2) {
            return this.singleCharacterSearch(index, text, fields, opts)
        }
    }

    public multipleCharacterSearch(
        index: string,
        text: string,
        fields: string[],
        opts?: ISearchOptions,
    ): Observable<SearchResponse<TrackES | ArtistES | AlbumES>> {
        let pagination = {}
        if (opts && opts.page && opts.limit) {
            pagination = {
                from: (opts.page - 1) * opts.limit,
                size: opts.limit,
            }
        }

        if (opts && !opts.sort) {
            opts.sort = []
        }

        this.logger.log(`Searching for ${text} in ${fields.join(', ')}`)
        const promise: Promise<SearchResponse<TrackES | ArtistES | AlbumES>> = this.client.search({
            index,
            body: {
                query: {
                    multi_match: {
                        query: text,
                        fields: fields.map((field) => (field.includes('^') ? field : `${field}^1`)),
                        type: 'best_fields',
                        fuzziness: 'AUTO',
                        tie_breaker: 0.3,
                    },
                },
                ...pagination,
                sort: opts.sort,
                highlight: {
                    fields: {
                        name_en: {},
                        name_th: {},
                        genres: {},
                    },
                    pre_tags: [
                        '<strong>',
                    ],
                    post_tags: [
                        '</strong>',
                    ],
                },
            },
        })

        return from(promise).pipe(
            switchMap((response: SearchResponse<TrackES | AlbumES | ArtistES>) =>
                this.getRelatedData(response).pipe(
                    map((updatedResponse: SearchResponse<TrackES | ArtistES | AlbumES>) => ({
                        ...updatedResponse,
                    })),
                    catchError((err) => {
                        this.logger.error(`Error getting related data: ${err}`)
                        throw err
                    }),
                ),
            ),
            catchError((err) => {
                this.logger.error(`Error in multiple character search: ${err}`)
                throw err
            }),
        )
    }

    public singleCharacterSearch(
        index: string,
        text: string,
        fields: string[],
        opts?: ISearchOptions,
    ): Observable<SearchResponse<TrackES | ArtistES | AlbumES>> {
        let pagination = {}
        if (opts && opts.page && opts.limit) {
            pagination = {
                from: (opts.page - 1) * opts.limit,
                size: opts.limit,
            }
        }

        const promise: Promise<SearchResponse<TrackES | ArtistES | AlbumES>> = this.client.search({
            index,
            body: {
                query: {
                    bool: {
                        should: fields.map((field) => ({
                            wildcard: {
                                [field]: {
                                    value: `${text.toLowerCase()}*`,
                                    boost: field === 'aliases' ? 1 : 2,
                                    _name: `${field.replace('.', '_')}`,
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
                            acc[field] = {}
                            return acc
                        },
                        {} as Record<string, {}>,
                    ),
                    pre_tags: [
                        '<strong>',
                    ],
                    post_tags: [
                        '</strong>',
                    ],
                },
            },
        })

        return from(promise).pipe(
            switchMap((response: SearchResponse<TrackES | AlbumES | ArtistES>) =>
                this.getRelatedData(response).pipe(
                    map((relatedData) => ({
                        ...response,
                        relatedData,
                    })),
                    catchError((err) => {
                        this.logger.error(`Error getting related data: ${err}`)
                        throw err
                    }),
                ),
            ),
            catchError((err) => {
                this.logger.error(`Error in single character search: ${err}`)
                throw err
            }),
        )
    }

    public getNewTracks(): Observable<SearchResponse<TrackES>> {
        const promise: Promise<SearchResponse<TrackES>> = this.client.search({
            index: ElasticConstant.INDICE.MUSIC,
            body: {
                size: 20,
                query: {
                    term: { type: 'track' },
                },
                sort: [
                    { releaseDate: { order: 'desc' } },
                ],
            },
        })

        return from(promise).pipe(
            catchError((err) => {
                this.logger.error(`Error getting new tracks: ${err}`)
                throw err
            }),
        )
    }

    public getTopTracks(): Observable<SearchResponse<TrackES>> {
        const promise: Promise<SearchResponse<TrackES>> = this.client.search({
            index: ElasticConstant.INDICE.MUSIC,
            body: {
                size: 20,
                query: {
                    term: { type: 'track' },
                },
                sort: [
                    { hitCounts: { order: 'desc' } },
                    { releaseDate: { order: 'desc' } },
                ],
            },
        })

        return from(promise).pipe(
            catchError((err) => {
                this.logger.error(`Error getting top tracks: ${err}`)
                throw err
            }),
        )
    }
}

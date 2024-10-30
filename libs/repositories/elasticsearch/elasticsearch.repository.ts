import { Client } from '@elastic/elasticsearch'
import { GetResponse, SearchResponse, SearchTotalHits, WriteResponseBase } from '@elastic/elasticsearch/lib/api/types'
import { ElasticConstant } from '@libs/common/constants'
import {
    IDocumentIndexOptions,
    ISearchOptions,
    ISearchRepository,
    RelatedData,
} from '@libs/repositories/interfaces/search/search.interface'
import { Logger } from '@nestjs/common'
import { Observable, forkJoin, from, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { AlbumES } from '../interfaces/search/album.interface'
import { ArtistES } from '../interfaces/search/artist.interface'
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
    ): Observable<WriteResponseBase> {
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

    public searchDocument(index: string, fields: Record<string, any>): Observable<SearchResponse<any>> {
        const promise = this._client.search({
            index,
            query: {
                bool: {
                    filter: Object.keys(fields).map((key) => ({
                        term: {
                            [key]: fields[key],
                        },
                    })),
                },
            },
        })
        return from(promise).pipe(
            catchError((err) => {
                this._logger.error(`Error getting document: ${err}`)
                throw err
            }),
        )
    }

    public getRelatedData(searchResponse: SearchResponse<TrackES | AlbumES | ArtistES>): Observable<RelatedData> {
        const hits = searchResponse.hits.hits
        const trackIds: number[] = []
        const albumIds: number[] = []
        const artistIds: number[] = []

        hits.forEach((hit) => {
            if (hit._source.type === 'track') {
                albumIds.push((hit._source as TrackES).album_id)
                artistIds.push(...(hit._source as TrackES).artist_ids)
            } else if (hit._source.type === 'album') {
                artistIds.push(...(hit._source as AlbumES).artist_ids)
                trackIds.push(...(hit._source as AlbumES).track_ids)
            } else if (hit._source.type === 'artist') {
                albumIds.push(...(hit._source as ArtistES).album_ids)
                trackIds.push(...(hit._source as ArtistES).track_ids)
            }
        })

        const trackObservables = trackIds
            .filter((id) => id)
            .map((id) =>
                this.searchDocument(ElasticConstant.INDICE.MUSIC, {
                    id: id.toString(),
                    type: 'track',
                }),
            )
        const albumObservables = albumIds
            .filter((id) => id)
            .map((id) => {
                return this.searchDocument(ElasticConstant.INDICE.MUSIC, {
                    id: id.toString(),
                    type: 'album',
                })
            })
        const artistObservables = artistIds
            .filter((id) => id)
            .map((id) =>
                this.searchDocument(ElasticConstant.INDICE.MUSIC, {
                    id: id.toString(),
                    type: 'artist',
                }),
            )

        if (trackObservables.length === 0 && albumObservables.length === 0 && artistObservables.length === 0) {
            return of({
                tracks: [],
                albums: [],
                artists: [],
            })
        }

        return forkJoin([
            ...trackObservables,
            ...albumObservables,
            ...artistObservables,
        ]).pipe(
            map((relatedDocs) => {
                const relatedData = relatedDocs.reduce(
                    (acc, doc) => {
                        if ((doc.hits.total as SearchTotalHits).value === 0) {
                            return acc
                        }

                        const data = doc.hits.hits[0]._source

                        if (data.type === 'track') {
                            acc.tracks.push(data)
                        } else if (data.type === 'album') {
                            acc.albums.push(data)
                        } else if (data.type === 'artist') {
                            acc.artists.push(data)
                        }
                        return acc
                    },
                    { tracks: [], albums: [], artists: [] },
                )
                return relatedData
            }),
        )
    }

    public getTrackRelatedData(track: TrackES): Observable<RelatedData> {
        const albumObservables = this.searchDocument(ElasticConstant.INDICE.MUSIC, {
            id: track.album_id.toString(),
            type: 'album',
        })

        const artistObservables = track.artist_ids
            .filter((id) => id)
            .map((id) =>
                this.searchDocument(ElasticConstant.INDICE.MUSIC, {
                    id: id.toString(),
                    type: 'artist',
                }),
            )

        if (albumObservables && artistObservables.length === 0) {
            return of({
                tracks: [],
                albums: [],
                artists: [],
            })
        }

        return forkJoin([
            albumObservables,
            ...artistObservables,
        ]).pipe(
            map((relatedDocs) => {
                const relatedData = relatedDocs.reduce(
                    (acc, doc) => {
                        if ((doc.hits.total as SearchTotalHits).value === 0) {
                            return acc
                        }

                        const data = doc.hits.hits[0]._source

                        if (data.type === 'album') {
                            acc.albums.push(data)
                        } else if (data.type === 'artist') {
                            acc.artists.push(data)
                        }
                        return acc
                    },
                    { tracks: [], albums: [], artists: [] },
                )

                return relatedData
            }),
        )
    }
}

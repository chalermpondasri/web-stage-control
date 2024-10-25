import { Client } from '@elastic/elasticsearch'
import { UpdateResponse, WriteResponseBase } from '@elastic/elasticsearch/lib/api/types'
import { SearchResponse } from '@elastic/elasticsearch/lib/api/typesWithBodyKey'
import { ElasticConstant } from '@libs/common/constants/elastic.constant'
import { Logger } from '@nestjs/common'
import { catchError, from, map, Observable, of, switchMap } from 'rxjs'
import { AlbumES } from '../interfaces/search/album.interface'
import { ISearchOptions } from '../interfaces/search/search.interface'
import { TrackES } from '../interfaces/search/track.interface'
import { ElasticsearchRepository } from './elasticsearch.repository'

export class TrackElasticRepository extends ElasticsearchRepository {
    private readonly logger: Logger = new Logger(TrackElasticRepository.name)

    public constructor(private readonly client: Client) {
        super(client)
    }

    public addTrack(track: TrackES): Observable<WriteResponseBase> {
        return this.indexDocument(ElasticConstant.INDICE.TRACK, track)
    }

    public updateTrack(track: Partial<TrackES>): Observable<WriteResponseBase> {
        return from(
            this.client.search({
                index: ElasticConstant.INDICE.TRACK,
                body: {
                    query: {
                        match: {
                            id: track.id,
                        },
                    },
                },
            }),
        ).pipe(
            switchMap((response) => {
                const id = response.hits.hits[0]?._id
                if (!id) {
                    // If not found, create instead and return id
                    return this.addTrack(track as TrackES).pipe(
                        map((addResponse) => {
                            const newId = addResponse._id
                            this.logger.log(`Track added with ID: ${newId}`)
                            return newId
                        }),
                        catchError((error) => {
                            this.logger.error(`Error adding track: ${error.message}`)
                            throw error
                        }),
                    )
                }
                this.logger.log(`Track found: ${id}`)
                return of(id)
            }),
            switchMap((id) => {
                console.log('Updating track: ' + id)
                return from(
                    this.client
                        .update({
                            index: ElasticConstant.INDICE.TRACK,
                            id: id.toString(),
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
                index: ElasticConstant.INDICE.TRACK,
                body: {
                    query: {
                        match: {
                            id: track.id,
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
                        index: ElasticConstant.INDICE.TRACK,
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

    public fuzzySearch(keyword: string, fields: string[], opts?: ISearchOptions): Observable<SearchResponse> {
        if (!opts.page) {
            opts.page = 1
        }

        if (!opts.fuzziness) {
            opts.fuzziness = 'AUTO'
        }

        if (fields.length === 0) {
            fields = [
                'title',
            ]
        }

        return this.fuzzySearchDocument(ElasticConstant.INDICE.TRACK, keyword, fields, opts)
    }

    public search(keyword: string, fields?: string[], opts?: ISearchOptions): Observable<SearchResponse<TrackES>> {
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
                'title_th',
                'title_en',
                'aliases',
                'artist.name',
                'album.title',
                'genres.name',
                'playlists.name',
            ]
        }

        return this.genericSearchDocument(ElasticConstant.INDICE.TRACK, keyword, fields, opts)
    }

    public searchArtistById(artistId: number): Observable<SearchResponse<TrackES>> {
        if (!artistId) {
            throw new Error('searchArtistById: artistId is required')
        }

        return this.searchDocument(ElasticConstant.INDICE.TRACK, {
            'artist.id': artistId,
        })
    }

    public searchAlbumsByArtistId(artistId: number): Observable<
        SearchResponse<{
            album: AlbumES
        }>
    > {
        if (!artistId) {
            throw new Error('searchAlbumsByArtistId: artistId is required')
        }

        return from(
            this.client.search<{
                album: AlbumES
            }>({
                index: ElasticConstant.INDICE.TRACK,
                body: {
                    query: {
                        term: {
                            'artist.id': artistId,
                        },
                    },
                    collapse: {
                        field: 'album.id', // Collapse by album ID for distinct albums
                    },
                    _source: [
                        'album.*',
                    ], // Retrieve album and artist fields
                },
            }),
        ).pipe(
            map((response) => {
                if (response.hits.hits.length === 0) {
                    throw new Error('No albums found for this artist')
                }
                return response
            }),
            catchError((error) => {
                this.logger.error(`Error searching albums for artist by id: ${error.message}`)
                throw error
            }),
        )
    }
}

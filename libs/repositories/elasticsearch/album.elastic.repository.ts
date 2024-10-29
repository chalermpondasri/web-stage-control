import { Client } from '@elastic/elasticsearch'
import { UpdateResponse, WriteResponseBase } from '@elastic/elasticsearch/lib/api/types'
import { SearchResponse } from '@elastic/elasticsearch/lib/api/typesWithBodyKey'
import { ElasticConstant } from '@libs/common/constants/elastic.constant'
import { Logger } from '@nestjs/common'
import { catchError, from, map, Observable, of, switchMap } from 'rxjs'
import { AlbumES } from '../interfaces/search/album.interface'
import { ArtistES } from '../interfaces/search/artist.interface'
import { TrackES } from '../interfaces/search/track.interface'
import { ElasticsearchRepository } from './elasticsearch.repository'

export class AlbumElasticRepository extends ElasticsearchRepository {
    private readonly logger: Logger = new Logger(AlbumElasticRepository.name)

    public constructor(private readonly client: Client) {
        super(client)
    }

    public addAlbum(album: Partial<AlbumES>): Observable<WriteResponseBase> {
        return this.indexDocument(ElasticConstant.INDICE.MUSIC, album)
    }

    public updateAlbum(album: Partial<AlbumES>): Observable<WriteResponseBase> {
        return from(
            this.client.search({
                index: ElasticConstant.INDICE.MUSIC,
                body: {
                    query: {
                        bool: {
                            must: [
                                { match: { id: album.id } },
                                { match: { type: 'album' } },
                            ],
                        },
                    },
                },
            }),
        ).pipe(
            switchMap((response) => {
                const id = response.hits.hits[0]?._id
                if (!id) {
                    return this.addAlbum(album as AlbumES).pipe(
                        map((addResponse) => {
                            const newId = addResponse._id
                            this.logger.log(`Album added with ID: ${newId}`)
                            return newId
                        }),
                        catchError((error) => {
                            this.logger.error(`Error adding album: ${error.message}`)
                            throw error
                        }),
                    )
                }
                this.logger.log(`Album found: ${id}`)
                return of(id)
            }),
            switchMap((id) => {
                console.log('Updating album: ' + id)
                return from(
                    this.client
                        .update({
                            index: ElasticConstant.INDICE.MUSIC,
                            id: id.toString(),
                            body: {
                                doc: album,
                            },
                        })
                        .then((response: UpdateResponse<unknown>) => {
                            return response as WriteResponseBase
                        }),
                )
            }),
            catchError((error) => {
                this.logger.error(`Error updating album: ${error.message}`)
                throw error
            }),
        )
    }

    public deleteAlbum(album: Partial<AlbumES>): Observable<WriteResponseBase> {
        return from(
            this.client.search({
                index: ElasticConstant.INDICE.MUSIC,
                body: {
                    query: {
                        bool: {
                            must: [
                                { match: { id: album.id } },
                                { match: { type: 'album' } },
                            ],
                        },
                    },
                },
            }),
        ).pipe(
            map((response) => {
                const id = response.hits.hits[0]?._id
                if (!id) {
                    throw new Error('Album not found on elasticsearch')
                }
                this.logger.log(`Album found: ${id}`)
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
                this.logger.error(`Error deleting album: ${error.message}`)
                throw error
            }),
        )
    }

    public searchAlbumById(albumId: number): Observable<SearchResponse<TrackES | AlbumES | ArtistES>> {
        if (!albumId) {
            throw new Error('searchAlbumById: albumId is required')
        }

        return this.searchDocument(ElasticConstant.INDICE.MUSIC, {
            id: albumId,
            type: 'album',
        })
    }

    public getTopAlbums(): Observable<
        {
            album_id: number
            total_hit_counts: number
        }[]
    > {
        const promise = this.client.search({
            index: ElasticConstant.INDICE.MUSIC,
            body: {
                size: 0,
                query: {
                    term: { type: 'track' },
                },
                aggs: {
                    top_albums: {
                        composite: {
                            sources: [
                                { album_id: { terms: { field: 'album_id' } } },
                            ],
                            size: 10, // Number of top albums to retrieve
                        },
                        aggs: {
                            total_hit_counts: {
                                sum: {
                                    field: 'hitCounts',
                                },
                            },
                        },
                    },
                },
            },
        })

        return from(promise).pipe(
            map((response) => {
                const topAlbums = (response.aggregations.top_albums as any).buckets.map((bucket) => ({
                    album_id: bucket.key.album_id,
                    total_hit_counts: bucket.total_hit_counts.value,
                }))
                return topAlbums
            }),
            catchError((err) => {
                this.logger.error(`Error fetching top albums: ${err}`)
                throw err
            }),
        )
    }
}

import { Client } from '@elastic/elasticsearch'
import { UpdateResponse, WriteResponseBase } from '@elastic/elasticsearch/lib/api/types'
import { SearchResponse } from '@elastic/elasticsearch/lib/api/typesWithBodyKey'
import { ElasticConstant } from '@libs/common/constants/elastic.constant'
import { Logger } from '@nestjs/common'
import { catchError, from, map, Observable, switchMap } from 'rxjs'
import { AlbumES } from '../interfaces/search/album.interface'
import { ArtistES } from '../interfaces/search/artist.interface'
import { TrackES } from '../interfaces/search/track.interface'
import { ElasticsearchRepository } from './elasticsearch.repository'

export class AlbumElasticRepository extends ElasticsearchRepository {
    private readonly logger: Logger = new Logger(AlbumElasticRepository.name)

    public constructor(private readonly client: Client) {
        super(client)
    }

    private searchAlbumByIdInternal(albumId: string): Observable<string> {
        return from(
            this.client.search({
                index: ElasticConstant.INDICE.MUSIC,
                body: {
                    query: {
                        bool: {
                            must: [
                                { match: { id: albumId } },
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
            catchError((error) => {
                this.logger.error(`Error searching album by ID: ${error.message}`)
                throw error
            }),
        )
    }

    public addAlbum(album: Partial<AlbumES>): Observable<WriteResponseBase> {
        return this.indexDocument(ElasticConstant.INDICE.MUSIC, album)
    }

    public updateAlbum(album: Partial<AlbumES>): Observable<WriteResponseBase> {
        return this.searchAlbumByIdInternal(album.id.toString()).pipe(
            switchMap((id) => {
                return from(
                    this.client.update({
                        index: ElasticConstant.INDICE.MUSIC,
                        id: id.toString(),
                        body: {
                            doc: album,
                        },
                    }),
                ).pipe(
                    map((response: UpdateResponse<unknown>) => response as WriteResponseBase),
                    catchError((error) => {
                        this.logger.error(`Error updating album: ${error.message}`)
                        throw error
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
        return this.searchAlbumByIdInternal(album.id.toString()).pipe(
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
                            size: 10000,
                        },
                        aggs: {
                            total_hit_counts: {
                                sum: {
                                    field: 'hitCounts',
                                },
                            },
                            total_hit_sort: {
                                bucket_sort: {
                                    sort: [
                                        { total_hit_counts: { order: 'desc' } },
                                    ],
                                    size: 10000,
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

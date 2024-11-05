import { Client } from '@elastic/elasticsearch'
import { SearchResponse, UpdateResponse, WriteResponseBase } from '@elastic/elasticsearch/lib/api/types'
import { ElasticConstant } from '@libs/common/constants/elastic.constant'
import { Logger } from '@nestjs/common'
import { catchError, from, map, Observable, of, switchMap } from 'rxjs'
import { AlbumES } from '../interfaces/search/album.interface'
import { ArtistES } from '../interfaces/search/artist.interface'
import { TrackES } from '../interfaces/search/track.interface'
import { ElasticsearchRepository } from './elasticsearch.repository'

export class ArtistElasticRepository extends ElasticsearchRepository {
    private readonly logger: Logger = new Logger(ArtistElasticRepository.name)

    public constructor(private readonly client: Client) {
        super(client)
    }

    public addArtist(artist: Partial<ArtistES>): Observable<WriteResponseBase> {
        return this.indexDocument(ElasticConstant.INDICE.MUSIC, artist)
    }

    public updateArtist(artist: Partial<ArtistES>): Observable<WriteResponseBase> {
        return from(
            this.client.search({
                index: ElasticConstant.INDICE.MUSIC,
                body: {
                    query: {
                        bool: {
                            must: [
                                { match: { id: artist.id } },
                                { match: { type: 'artist' } },
                            ],
                        },
                    },
                },
            }),
        ).pipe(
            switchMap((response) => {
                const id = response.hits.hits[0]?._id
                if (!id) {
                    return this.addArtist(artist as ArtistES).pipe(
                        map((addResponse) => {
                            const newId = addResponse._id
                            this.logger.log(`Artist added with ID: ${newId}`)
                            return newId
                        }),
                        catchError((error) => {
                            this.logger.error(`Error adding artist: ${error.message}`)
                            throw error
                        }),
                    )
                }
                this.logger.log(`Artist found: ${id}`)
                return of(id)
            }),
            switchMap((id) => {
                return from(
                    this.client
                        .update({
                            index: ElasticConstant.INDICE.MUSIC,
                            id: id.toString(),
                            body: {
                                doc: artist,
                            },
                        })
                        .then((response: UpdateResponse<unknown>) => {
                            return response as WriteResponseBase
                        }),
                )
            }),
            catchError((error) => {
                this.logger.error(`Error updating artist: ${error.message}`)
                throw error
            }),
        )
    }

    public deleteArtist(artist: Partial<ArtistES>): Observable<WriteResponseBase> {
        return from(
            this.client.search({
                index: ElasticConstant.INDICE.MUSIC,
                body: {
                    query: {
                        bool: {
                            must: [
                                { match: { id: artist.id } },
                                { match: { type: 'artist' } },
                            ],
                        },
                    },
                },
            }),
        ).pipe(
            map((response) => {
                const id = response.hits.hits[0]?._id
                if (!id) {
                    throw new Error('Artist not found on elasticsearch')
                }
                this.logger.log(`Artist found: ${id}`)
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
                this.logger.error(`Error deleting artist: ${error.message}`)
                throw error
            }),
        )
    }

    public searchArtistById(artistId: number): Observable<SearchResponse<TrackES | ArtistES | AlbumES>> {
        if (!artistId) {
            throw new Error('searchArtistById: artistId is required')
        }

        return this.searchDocument(ElasticConstant.INDICE.MUSIC, {
            id: artistId,
            type: 'artist',
        })
    }

    public getTopArtist(): Observable<
        {
            artist_id: number
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
                    top_artists: {
                        composite: {
                            sources: [
                                { artist_id: { terms: { field: 'artist_ids' } } },
                            ],
                            size: 10000, // Connot more than 65k, which means artist in the system cannot exceed this number.
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
                console.log((response.aggregations.top_artists as any).buckets)
                const topArtists = (response.aggregations.top_artists as any).buckets.map((bucket) => ({
                    artist_id: bucket.key.artist_id,
                    total_hit_counts: bucket.total_hit_counts.value,
                }))
                return topArtists
            }),
            catchError((err) => {
                this.logger.error(`Error fetching top artists: ${err}`)
                throw err
            }),
        )
    }
}

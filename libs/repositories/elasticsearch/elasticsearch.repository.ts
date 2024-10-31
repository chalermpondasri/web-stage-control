import { Client } from '@elastic/elasticsearch'
import { GetResponse, SearchResponse, SearchTotalHits, WriteResponseBase } from '@elastic/elasticsearch/lib/api/types'
import { ElasticConstant } from '@libs/common/constants'
import {
    IDocumentIndexOptions,
    ISearchOptions,
    ISearchRepository,
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

    public getRelatedData(
        searchResponse: SearchResponse<TrackES | AlbumES | ArtistES>,
    ): Observable<SearchResponse<TrackES | ArtistES | AlbumES>> {
        const hits = searchResponse.hits.hits

        const albumCache = new Map<string, AlbumES | null>()
        const artistCache = new Map<string, ArtistES | null>()
        const trackCache = new Map<string, TrackES | null>()

        const getAlbum = (albumId: string): Observable<AlbumES | null> => {
            if (albumCache.has(albumId)) {
                return of(albumCache.get(albumId))
            }

            return this.searchDocument(ElasticConstant.INDICE.MUSIC, {
                id: albumId,
                type: 'album',
            }).pipe(
                map((doc) => {
                    const album =
                        (doc.hits.total as SearchTotalHits).value === 0 ? null : (doc.hits.hits[0]._source as AlbumES)
                    albumCache.set(albumId, album)
                    return album
                }),
            )
        }

        const getArtist = (artistId: string): Observable<ArtistES | null> => {
            if (artistCache.has(artistId)) {
                return of(artistCache.get(artistId))
            }

            return this.searchDocument(ElasticConstant.INDICE.MUSIC, {
                id: artistId,
                type: 'artist',
            }).pipe(
                map((doc) => {
                    const artist =
                        (doc.hits.total as SearchTotalHits).value === 0 ? null : (doc.hits.hits[0]._source as ArtistES)
                    artistCache.set(artistId, artist)
                    return artist
                }),
            )
        }

        const getTrack = (trackId: string): Observable<TrackES | null> => {
            if (trackCache.has(trackId)) {
                return of(trackCache.get(trackId))
            }

            return this.searchDocument(ElasticConstant.INDICE.MUSIC, {
                id: trackId,
                type: 'track',
            }).pipe(
                map((doc) => {
                    const track =
                        (doc.hits.total as SearchTotalHits).value === 0 ? null : (doc.hits.hits[0]._source as TrackES)
                    trackCache.set(trackId, track)
                    return track
                }),
            )
        }

        const observables = hits.map((hit) => {
            if (hit._source.type === 'track') {
                const source = hit._source as TrackES
                source.artists = []
                source.album = null

                const albumObservable = source.album_id
                    ? getAlbum(source.album_id.toString()).pipe(
                          map((album) => {
                              source.album = album
                              return source
                          }),
                      )
                    : of(source)

                const artistObservables = source.artist_ids
                    ? source.artist_ids.map((artistId) =>
                          getArtist(artistId.toString()).pipe(
                              map((artist) => {
                                  source.artists.push(artist)
                                  return source
                              }),
                          ),
                      )
                    : [
                          of(source),
                      ]

                return forkJoin([
                    albumObservable,
                    ...artistObservables,
                ]).pipe(map(() => source))
            }

            if (hit._source.type === 'album') {
                const source = hit._source as AlbumES
                source.artists = []
                source.tracks = []

                const artistObservables = source.artist_ids
                    ? source.artist_ids.map((artistId) =>
                          getArtist(artistId.toString()).pipe(
                              map((artist) => {
                                  source.artists.push(artist)
                                  return source
                              }),
                          ),
                      )
                    : [
                          of(source),
                      ]

                const trackObservables = source.track_ids
                    ? source.track_ids.map((trackId) =>
                          getTrack(trackId.toString()).pipe(
                              map((track) => {
                                  source.tracks.push(track)
                                  return source
                              }),
                          ),
                      )
                    : [
                          of(source),
                      ]

                return forkJoin([
                    ...artistObservables,
                    ...trackObservables,
                ]).pipe(map(() => source))
            }

            if (hit._source.type === 'artist') {
                const source = hit._source as ArtistES
                source.albums = []
                source.tracks = []

                const albumObservables = source.album_ids
                    ? source.album_ids.map((albumId) =>
                          getAlbum(albumId.toString()).pipe(
                              map((album) => {
                                  source.albums.push(album)
                                  return source
                              }),
                          ),
                      )
                    : [
                          of(source),
                      ]

                const trackObservables = source.track_ids
                    ? source.track_ids.map((trackId) =>
                          getTrack(trackId.toString()).pipe(
                              map((track) => {
                                  source.tracks.push(track)
                                  return source
                              }),
                          ),
                      )
                    : [
                          of(source),
                      ]

                return forkJoin([
                    ...albumObservables,
                    ...trackObservables,
                ]).pipe(map(() => source))
            }

            return of(hit._source)
        })

        return forkJoin(observables).pipe(
            map(() => {
                return searchResponse
            }),
        )
    }

    public getTrackRelatedData(track: TrackES): Observable<any> {
        const albumObservables = track.album_id
            ? this.searchDocument(ElasticConstant.INDICE.MUSIC, {
                  id: track.album_id.toString(),
                  type: 'album',
              })
            : of(null)

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
                        if (doc === null || (doc.hits.total as SearchTotalHits).value === 0) {
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

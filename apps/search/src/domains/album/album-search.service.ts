import { SearchHit, SearchResponse, SearchTotalHits } from '@elastic/elasticsearch/lib/api/types'
import { ProviderName } from '@libs/common/constants'
import { AlbumElasticRepository } from '@libs/repositories/elasticsearch/album.elastic.repository'
import { TrackElasticRepository } from '@libs/repositories/elasticsearch/track.elastic.repository'
import { AlbumES } from '@libs/repositories/interfaces/search/album.interface'
import { ArtistES } from '@libs/repositories/interfaces/search/artist.interface'
import { RelatedData } from '@libs/repositories/interfaces/search/search.interface'
import { TrackES } from '@libs/repositories/interfaces/search/track.interface'
import { Lang } from '@libs/utilities/lang.util'
import { HttpException, HttpStatus, Inject, Logger } from '@nestjs/common'
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs'
import { TrackSearchDto } from '../track/dtos/track.dto'
import { AlbumSearchDto } from './dtos/album.dto'

export class SearchAlbumService {
    private readonly logger = new Logger(SearchAlbumService.name)

    constructor(
        @Inject(ProviderName.TRACK_REPOSITORY)
        private trackRepository: TrackElasticRepository,

        @Inject(ProviderName.ALBUM_REPOSITORY)
        private albumRepository: AlbumElasticRepository,
    ) {}

    public searchAlbumById(id: number): Observable<AlbumSearchDto> {
        if (!id) {
            throw new Error('id is required')
        }

        return this.albumRepository.searchAlbumById(id).pipe(
            map((response) => {
                if ((response.hits.total as SearchTotalHits).value === 0) {
                    throw new Error('Album not found')
                }

                return response
            }),
            switchMap((response: SearchResponse<TrackES | AlbumES | ArtistES>) => {
                return this.albumRepository.getRelatedData(response).pipe(
                    map((relatedData) => ({
                        ...response,
                        relatedData,
                    })),
                )
            }),
            switchMap((response) => {
                const hit = response.hits.hits[0] as SearchHit<AlbumES>
                const relatedData = response.relatedData
                const trackAlbumCache: { [albumId: number]: AlbumES } = {}
                const trackObservables = relatedData.tracks.map((track) => {
                    if (track.album_id && trackAlbumCache[track.album_id]) {
                        track.album = trackAlbumCache[track.album_id]
                        return of(track)
                    } else {
                        return this.albumRepository.getTrackRelatedData(track).pipe(
                            map((trackRelatedData) => {
                                const album = trackRelatedData.albums[0]
                                if (track.album_id) {
                                    trackAlbumCache[track.album_id] = album
                                }
                                track.album = album
                                return track
                            }),
                        )
                    }
                })

                return forkJoin(trackObservables).pipe(
                    map((updatedTracks) => {
                        relatedData.tracks = updatedTracks
                        const foundLang = Lang.Thai
                        return this.getAlbumSearchDto(hit, foundLang, relatedData)
                    }),
                )
            }),
            catchError((err) => {
                this.logger.error(`Error searching album by id: ${err}`)
                throw new HttpException(err.message, HttpStatus.NOT_FOUND)
            }),
        )
    }

    private getTrackSearchDto(
        hit: SearchHit<TrackES>,
        foundLang: string = Lang.Thai,
        relatedData: RelatedData,
    ): TrackSearchDto {
        const name = foundLang === Lang.Thai ? hit._source.name_th : hit._source.name_en

        const trackDto = TrackSearchDto.toDto(
            {
                ...hit._source,
            },
            {
                artists: relatedData.artists.map((artist) => {
                    return {
                        ...artist,
                        name: foundLang === Lang.Thai ? artist.name_th : artist.name_en,
                    }
                }),
                album: {
                    ...relatedData.albums[0],
                    name: foundLang === Lang.Thai ? relatedData.albums[0].name_th : relatedData.albums[0].name_en,
                },
            },
        )

        trackDto.name = name
        return trackDto
    }

    private getAlbumSearchDto(
        hit: SearchHit<AlbumES>,
        foundLang: string = Lang.Thai,
        relatedData: RelatedData,
    ): AlbumSearchDto {
        const name = foundLang === Lang.Thai ? hit._source.name_th : hit._source.name_en

        const albumDto = AlbumSearchDto.toDto({
            ...hit._source,
            ...relatedData,
        })

        albumDto.name = name
        return albumDto
    }

    public getTopAlbums(): Observable<AlbumSearchDto[]> {
        return this.albumRepository.getTopAlbums().pipe(
            switchMap((topAlbums) => {
                const albumObservables = topAlbums.map((album) =>
                    this.albumRepository.searchAlbumById(album.album_id).pipe(
                        map((response) => {
                            const hit = response.hits.hits[0] as SearchHit<AlbumES>
                            const albumDto: AlbumSearchDto & {
                                total_hit_counts?: number
                            } = AlbumSearchDto.toDto(hit._source)
                            albumDto.total_hit_counts = album.total_hit_counts
                            return albumDto
                        }),
                    ),
                )

                return forkJoin(albumObservables).pipe(
                    map((albums) => albums.sort((a, b) => b.total_hit_counts - a.total_hit_counts)),
                )
            }),
            catchError((err) => {
                this.logger.error(`Error getting top albums: ${err}`)
                throw new HttpException(err.message, HttpStatus.NOT_FOUND)
            }),
        )
    }
}

import { SearchHit, SearchResponse, SearchTotalHits, WriteResponseBase } from '@elastic/elasticsearch/lib/api/types'
import { ProviderName } from '@libs/common/constants'
import { ListResponse } from '@libs/common/models'
import { TrackElasticRepository } from '@libs/repositories/elasticsearch/track.elastic.repository'
import { AlbumES } from '@libs/repositories/interfaces/search/album.interface'
import { ArtistES } from '@libs/repositories/interfaces/search/artist.interface'
import { TrackES } from '@libs/repositories/interfaces/search/track.interface'
import { detectLanguage, Lang } from '@libs/utilities/lang.util'
import { HttpException, HttpStatus, Inject, Logger } from '@nestjs/common'
import { catchError, forkJoin, map, Observable, switchMap } from 'rxjs'
import { AlbumSearchDto } from '../album/dtos/album.dto'
import { ArtistSearchDto } from '../artist/dtos/artist.dto'
import { TrackSearchDto } from './dtos/track.dto'
import { ITrackService } from './interfaces/service.interface'

export class SearchTrackService implements ITrackService {
    private readonly logger = new Logger(SearchTrackService.name)
    constructor(
        @Inject(ProviderName.TRACK_REPOSITORY)
        private trackRepository: TrackElasticRepository,
    ) {}

    public searchTracksByKeyword(
        keyword: string,
        page: number,
        limit: number,
    ): Observable<ListResponse<TrackSearchDto | ArtistSearchDto | AlbumSearchDto>> {
        if (!page) {
            page = 1
        }
        if (!limit) {
            limit = 20
        }

        const fields = [
            'name_th^2',
            'name_en^2',
            'aliases',
        ]

        return this.trackRepository
            .search(keyword, fields, {
                limit,
                page,
            })
            .pipe(
                map((response) => {
                    const hits = response.hits.hits

                    const found: (TrackSearchDto | ArtistSearchDto | AlbumSearchDto)[] = hits
                        .map((hit): TrackSearchDto | ArtistSearchDto | AlbumSearchDto => {
                            const foundLang = detectLanguage(keyword)
                            switch (hit._source.type) {
                                case 'track':
                                    return this.getTrackSearchDto(hit as SearchHit<TrackES>, foundLang)
                                case 'artist':
                                    return this.getArtistSearchDto(hit as SearchHit<ArtistES>, foundLang)
                                case 'album':
                                    return this.getAlbumSearchDto(hit as SearchHit<AlbumES>, foundLang)
                            }
                        })
                        .flat(2)

                    const listResponse = new ListResponse<TrackSearchDto | ArtistSearchDto | AlbumSearchDto>()
                    listResponse.data = found
                    listResponse.total = (response.hits.total as SearchTotalHits).value
                    listResponse.page = page
                    listResponse.limit = limit

                    return listResponse
                }),
                catchError((err) => {
                    this.logger.error(`Error searching tracks: ${err}`)
                    throw err
                }),
            )
    }

    private getTrackSearchDto(hit: SearchHit<TrackES>, foundLang: string = Lang.Thai): TrackSearchDto {
        const name = foundLang === Lang.Thai ? hit._source.name_th : hit._source.name_en || hit._source.name_th
        const trackDto = TrackSearchDto.toDto({
            ...hit._source,
        })

        trackDto.name = name
        return trackDto
    }

    private getArtistSearchDto(hit: SearchHit<ArtistES>, foundLang: string = Lang.Thai): ArtistSearchDto {
        const name = foundLang === Lang.Thai ? hit._source.name_th : hit._source.name_en || hit._source.name_th

        const artistDto = ArtistSearchDto.toDto({
            ...hit._source,
        })

        artistDto.name = name
        return artistDto
    }

    private getAlbumSearchDto(hit: SearchHit<AlbumES>, foundLang: string = Lang.Thai): AlbumSearchDto {
        const name = foundLang === Lang.Thai ? hit._source.name_th : hit._source.name_en || hit._source.name_th

        const albumDto = AlbumSearchDto.toDto({
            ...hit._source,
        })

        albumDto.name = name
        return albumDto
    }

    public getNewTracks(): Observable<ListResponse<TrackSearchDto>> {
        return this.trackRepository.getNewTracks().pipe(
            switchMap((response) => {
                const hits = response.hits.hits as SearchHit<TrackES>[]
                const trackObservables = hits.map((hit) =>
                    this.trackRepository.getTrackRelatedData(hit._source, true, true).pipe(
                        map((track) => {
                            track.artists.forEach((artist) => {
                                delete artist.image
                                delete artist.coverImage
                            })

                            if (track.album) {
                                delete track.album.image
                                delete track.album.releaseDate
                            }

                            hit._source = track
                            return hit
                        }),
                    ),
                )

                return forkJoin(trackObservables).pipe(map(() => response))
            }),
            map((response) => {
                const hits = response.hits.hits as SearchHit<TrackES>[]
                const tracks = hits.map((hit) => this.getTrackSearchDto(hit))
                const listResponse = new ListResponse<TrackSearchDto>()
                listResponse.data = tracks
                listResponse.total = (response.hits.total as SearchTotalHits).value
                listResponse.page = 1
                listResponse.limit = tracks.length
                return listResponse
            }),
            catchError((err) => {
                this.logger.error(`Error getting new tracks: ${err}`)
                throw new HttpException(err.message, HttpStatus.NOT_FOUND)
            }),
        )
    }

    public getTopTracks(): Observable<ListResponse<TrackSearchDto>> {
        return this.trackRepository.getTopTracks().pipe(
            switchMap((response) => {
                const hits = response.hits.hits as SearchHit<TrackES>[]
                const trackObservables = hits.map((hit) =>
                    this.trackRepository.getTrackRelatedData(hit._source, true, true).pipe(
                        map((track) => {
                            hit._source = track

                            track.artists.forEach((artist) => {
                                delete artist.image
                                delete artist.coverImage
                            })

                            if (track.album) {
                                delete track.album.image
                                delete track.album.releaseDate
                            }
                            return hit
                        }),
                    ),
                )

                return forkJoin(trackObservables).pipe(map(() => response))
            }),
            map((response) => {
                const hits = response.hits.hits as SearchHit<TrackES>[]
                const tracks = hits.map((hit) => this.getTrackSearchDto(hit))
                const listResponse = new ListResponse<TrackSearchDto>()
                listResponse.data = tracks
                listResponse.total = (response.hits.total as SearchTotalHits).value
                listResponse.page = 1
                listResponse.limit = tracks.length
                return listResponse
            }),
            catchError((err) => {
                this.logger.error(`Error getting top tracks: ${err}`)
                throw new HttpException(err.message, HttpStatus.NOT_FOUND)
            }),
        )
    }

    public searchTrackById(id: number): Observable<ListResponse<TrackSearchDto>> {
        if (!id) {
            throw new Error('id is required')
        }

        return this.trackRepository.searchTrackById(id).pipe(
            map((response) => {
                if ((response.hits.total as SearchTotalHits).value === 0) {
                    throw new Error('Track not found')
                }

                return response
            }),
            switchMap((response: SearchResponse<TrackES | TrackES | AlbumES>) => {
                return this.trackRepository.getRelatedData(response).pipe(
                    map((updatedResponse) => {
                        return {
                            ...updatedResponse,
                        }
                    }),
                )
            }),
            map((response) => {
                const hit = response.hits.hits[0] as SearchHit<TrackES>
                const foundLang = Lang.Thai
                return this.getTrackSearchDto(hit, foundLang)
            }),
            map((track) => {
                const listResponse = new ListResponse<TrackSearchDto>()
                listResponse.data = [
                    track,
                ]
                listResponse.total = 1
                listResponse.page = 1
                listResponse.limit = 1
                return listResponse
            }),
            catchError((err) => {
                this.logger.error(`Error searching track by id:`)
                this.logger.error(err)
                throw new HttpException(err.message, HttpStatus.NOT_FOUND)
            }),
        )
    }

    public addHitCountsToTrack(trackId: number): Observable<WriteResponseBase> {
        return this.trackRepository.searchTrackById(trackId).pipe(
            map((response) => {
                if ((response.hits.total as SearchTotalHits).value === 0) {
                    throw new Error('Track not found')
                }

                return response
            }),
            switchMap((response: SearchResponse<TrackES | AlbumES | ArtistES>) => {
                return this.trackRepository.addHitCounts(response)
            }),
            catchError((err) => {
                this.logger.error(`Error adding hit counts to track:`)
                this.logger.error(err)
                throw new HttpException(err.message, HttpStatus.NOT_FOUND)
            }),
        )
    }
}

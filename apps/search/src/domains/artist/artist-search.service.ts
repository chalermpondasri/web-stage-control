import { SearchHit, SearchResponse, SearchTotalHits } from '@elastic/elasticsearch/lib/api/types'
import { ProviderName } from '@libs/common/constants'
import { ArtistElasticRepository } from '@libs/repositories/elasticsearch/artist.elastic.repository'
import { TrackElasticRepository } from '@libs/repositories/elasticsearch/track.elastic.repository'
import { AlbumES } from '@libs/repositories/interfaces/search/album.interface'
import { ArtistES } from '@libs/repositories/interfaces/search/artist.interface'
import { RelatedData } from '@libs/repositories/interfaces/search/search.interface'
import { TrackES } from '@libs/repositories/interfaces/search/track.interface'
import { Lang } from '@libs/utilities/lang.util'
import { HttpException, HttpStatus, Inject, Logger } from '@nestjs/common'
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs'
import { AlbumSearchDto } from '../album/dtos/album.dto'
import { TrackSearchDto } from '../track/dtos/track.dto'
import { ArtistSearchDto } from './dtos/artist.dto'

export class SearchArtistService {
    private readonly logger = new Logger(SearchArtistService.name)
    constructor(
        // TODO:: เก็บไว้คุยว่าควรออกแบบยังไงดี ตั้งชื่อยังไงดี เพราะทุกอย่างอยู่ใน indice เดียวกัน
        @Inject(ProviderName.TRACK_REPOSITORY)
        private trackRepository: TrackElasticRepository,

        @Inject(ProviderName.ARTIST_REPOSITORY)
        private artistRepository: ArtistElasticRepository,
    ) {}

    public searchArtistById(id: number): Observable<ArtistSearchDto> {
        if (!id) {
            throw new Error('id is required')
        }

        return this.artistRepository.searchArtistById(id).pipe(
            map((response) => {
                if ((response.hits.total as SearchTotalHits).value === 0) {
                    throw new Error('Artist not found')
                }

                return response
            }),
            switchMap((response: SearchResponse<TrackES | ArtistES | AlbumES>) => {
                return this.artistRepository.getRelatedData(response).pipe(
                    map((relatedData) => {
                        return {
                            ...response,
                            relatedData,
                        }
                    }),
                )
            }),
            switchMap((response) => {
                const hit = response.hits.hits[0] as SearchHit<ArtistES>
                const relatedData = response.relatedData
                const trackAlbumCache: { [albumId: number]: AlbumES } = {}
                const trackObservables = relatedData.tracks.map((track) => {
                    if (track.album_id && trackAlbumCache[track.album_id]) {
                        track.album = trackAlbumCache[track.album_id]
                        return of(track)
                    } else {
                        return this.artistRepository.getTrackRelatedData(track).pipe(
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
                        return this.getArtistSearchDto(hit, foundLang, relatedData)
                    }),
                )
            }),
            catchError((err) => {
                this.logger.error(`Error searching artist by id:`)
                this.logger.error(err)
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
                album: relatedData.albums[0]
                    ? {
                          ...relatedData.albums[0],
                          name: foundLang === Lang.Thai ? relatedData.albums[0].name_th : relatedData.albums[0].name_en,
                      }
                    : null,
            },
        )

        trackDto.name = name
        return trackDto
    }

    private getArtistSearchDto(
        hit: SearchHit<ArtistES>,
        foundLang: string = Lang.Thai,
        relatedData: RelatedData,
    ): ArtistSearchDto {
        const name = foundLang === Lang.Thai ? hit._source.name_th : hit._source.name_en

        const artistDto = ArtistSearchDto.toDto({
            ...hit._source,
            ...relatedData,
        })

        artistDto.name = name
        return artistDto
    }

    private getAlbumSearchDto(
        hit: SearchHit<AlbumES>,
        foundLang: string = Lang.Thai,
        relatedData: RelatedData,
    ): AlbumSearchDto {
        const name = foundLang === Lang.Thai ? hit._source.name_th : hit._source.name_en

        const albumDto = AlbumSearchDto.toDto({
            ...hit._source,
        })

        albumDto.name = name
        return albumDto
    }

    public getTopArtist(): Observable<ArtistSearchDto[]> {
        // get top artist based on listenCOunt from their track
        return this.artistRepository.getTopArtist().pipe(
            switchMap((topArtists) => {
                const artistObservables = topArtists.map((artist) => {
                    return this.artistRepository.searchArtistById(artist.artist_id).pipe(
                        map((response) => {
                            const hit = response.hits.hits[0] as SearchHit<ArtistES>
                            const artistDto: ArtistSearchDto & {
                                total_hit_counts?: number
                            } = ArtistSearchDto.toDto(hit._source)
                            artistDto.total_hit_counts = artist.total_hit_counts
                            return artistDto
                        }),
                    )
                })

                return forkJoin(artistObservables).pipe(
                    map((artists) => artists.sort((a, b) => b.total_hit_counts - a.total_hit_counts)),
                )
            }),
            catchError((err) => {
                this.logger.error(`Error getting top artist: ${err}`)
                throw new HttpException(err.message, HttpStatus.NOT_FOUND)
            }),
        )
    }
}

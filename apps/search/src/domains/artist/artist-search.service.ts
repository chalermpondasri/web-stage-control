import { SearchHit, SearchResponse, SearchTotalHits } from '@elastic/elasticsearch/lib/api/types'
import { ProviderName } from '@libs/common/constants'
import { ListResponse, ObjectResponse } from '@libs/common/models'
import { ArtistElasticRepository } from '@libs/repositories/elasticsearch/artist.elastic.repository'
import { AlbumES } from '@libs/repositories/interfaces/search/album.interface'
import { ArtistES } from '@libs/repositories/interfaces/search/artist.interface'
import { RelatedData } from '@libs/repositories/interfaces/search/search.interface'
import { TrackES } from '@libs/repositories/interfaces/search/track.interface'
import { Lang } from '@libs/utilities/lang.util'
import { HttpException, HttpStatus, Inject, Logger } from '@nestjs/common'
import { Observable, catchError, forkJoin, map, switchMap } from 'rxjs'
import { AlbumSearchDto } from '../album/dtos/album.dto'
import { ArtistSearchDto } from './dtos/artist.dto'

export class SearchArtistService {
    private readonly logger = new Logger(SearchArtistService.name)
    constructor(
        @Inject(ProviderName.ARTIST_REPOSITORY)
        private artistRepository: ArtistElasticRepository,
    ) {}

    public searchArtistById(id: number): Observable<ObjectResponse<ArtistSearchDto>> {
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
                    map((updatedResponse) => {
                        return {
                            ...updatedResponse,
                        }
                    }),
                )
            }),
            switchMap((response) => {
                const hits = response.hits.hits as SearchHit<ArtistES>[]
                const trackObservables = hits.flatMap((hit) =>
                    hit._source.tracks.map((track) =>
                        this.artistRepository.getTrackRelatedData(track, true, false).pipe(
                            map((_track) => {
                                track = _track
                            }),
                        ),
                    ),
                )

                return forkJoin(trackObservables).pipe(map(() => response))
            }),
            map((response) => {
                const hits = response.hits.hits as SearchHit<ArtistES>[]
                hits.forEach((hit) => {
                    const tracks = hit._source.tracks
                    tracks.forEach((track) => {
                        delete track.audioFile
                        delete track.mvFile
                        delete track.genres
                        delete track.duration
                        delete track?.album?.image
                        delete track?.album?.releaseDate
                    })
                })
                return response
            }),
            map((response) => {
                const hit = response.hits.hits[0] as SearchHit<ArtistES>
                const foundLang = Lang.Thai
                return this.getArtistSearchDto(hit, foundLang)
            }),
            map((artist) => {
                const listResponse = new ObjectResponse<ArtistSearchDto>()
                listResponse.data = artist
                listResponse.total = 1
                listResponse.page = 1
                listResponse.limit = 1
                return listResponse
            }),
            catchError((err) => {
                this.logger.error(`Error searching artist by id:`, err)
                throw new HttpException(err.message, HttpStatus.NOT_FOUND)
            }),
        )
    }

    private getArtistSearchDto(hit: SearchHit<ArtistES>, foundLang: string = Lang.Thai): ArtistSearchDto {
        const name = foundLang === Lang.Thai ? hit._source.name_th : hit._source.name_en

        const artistDto = ArtistSearchDto.toDto({
            ...hit._source,
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

    public getTopArtist(): Observable<ListResponse<ArtistSearchDto>> {
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
                    map((artists) => {
                        const listResponse = new ListResponse<ArtistSearchDto>()
                        listResponse.data = artists as ArtistSearchDto[]
                        listResponse.total = artists.length
                        listResponse.page = 1
                        listResponse.limit = 999

                        artists.forEach((artist) => {
                            delete artist.total_hit_counts
                        })
                        return listResponse
                    }),
                )
            }),
            catchError((err) => {
                this.logger.error(`Error getting top artist: ${err}`)
                throw new HttpException(err.message, HttpStatus.NOT_FOUND)
            }),
        )
    }
}

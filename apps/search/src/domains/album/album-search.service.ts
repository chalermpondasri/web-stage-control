import { SearchHit, SearchResponse, SearchTotalHits } from '@elastic/elasticsearch/lib/api/types'
import { ProviderName } from '@libs/common/constants'
import { ListResponse } from '@libs/common/models'
import { AlbumElasticRepository } from '@libs/repositories/elasticsearch/album.elastic.repository'
import { TrackElasticRepository } from '@libs/repositories/elasticsearch/track.elastic.repository'
import { AlbumES } from '@libs/repositories/interfaces/search/album.interface'
import { ArtistES } from '@libs/repositories/interfaces/search/artist.interface'
import { TrackES } from '@libs/repositories/interfaces/search/track.interface'
import { Lang } from '@libs/utilities/lang.util'
import { HttpException, HttpStatus, Inject, Logger } from '@nestjs/common'
import { Observable, catchError, forkJoin, map, switchMap } from 'rxjs'
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
                    map((updatedResponse) => ({
                        ...updatedResponse,
                    })),
                )
            }),
            switchMap((response) => {
                const hits = response.hits.hits as SearchHit<AlbumES>[]
                const trackObservables = hits.flatMap((hit) =>
                    hit._source.tracks.map((track) =>
                        this.albumRepository.getTrackRelatedData(track, false, true).pipe(
                            map((_track) => {
                                track = _track
                                track.artists.forEach((artist) => {
                                    delete artist.image
                                    delete artist.coverImage
                                })
                            }),
                        ),
                    ),
                )

                return forkJoin(trackObservables).pipe(map(() => response))
            }),
            map((response) => {
                const hit = response.hits.hits[0] as SearchHit<AlbumES>
                const foundLang = Lang.Thai
                return this.getAlbumSearchDto(hit, foundLang)
            }),
            catchError((err) => {
                this.logger.error(`Error searching album by id: ${err}`)
                throw new HttpException(err.message, HttpStatus.NOT_FOUND)
            }),
        )
    }

    private getAlbumSearchDto(hit: SearchHit<AlbumES>, foundLang: string = Lang.Thai): AlbumSearchDto {
        const name = foundLang === Lang.Thai ? hit._source.name_th : hit._source.name_en || hit._source.name_th

        const albumDto = AlbumSearchDto.toDto({
            ...hit._source,
        })

        albumDto.name = name
        return albumDto
    }

    public getTopAlbums(): Observable<ListResponse<AlbumSearchDto>> {
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
                    map((albums) => {
                        return albums.map((album) => {
                            delete album.total_hit_counts
                            return album
                        })
                    }),
                    map((albums) => {
                        const listResponse = new ListResponse<AlbumSearchDto>()
                        listResponse.data = albums
                        listResponse.total = albums.length
                        listResponse.page = 1
                        listResponse.limit = 999

                        return listResponse
                    }),
                )
            }),
            catchError((err) => {
                this.logger.error(`Error getting top albums: ${err}`)
                throw new HttpException(err.message, HttpStatus.NOT_FOUND)
            }),
        )
    }
}

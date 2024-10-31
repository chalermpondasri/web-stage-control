import { SearchHit, SearchTotalHits } from '@elastic/elasticsearch/lib/api/types'
import { ProviderName } from '@libs/common/constants'
import { ListResponse } from '@libs/common/models'
import { TrackElasticRepository } from '@libs/repositories/elasticsearch/track.elastic.repository'
import { AlbumES } from '@libs/repositories/interfaces/search/album.interface'
import { ArtistES } from '@libs/repositories/interfaces/search/artist.interface'
import { TrackES } from '@libs/repositories/interfaces/search/track.interface'
import { detectLanguage, Lang } from '@libs/utilities/lang.util'
import { Inject, Logger } from '@nestjs/common'
import { catchError, map, Observable } from 'rxjs'
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
            'name_th',
            'name_en',
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

                    this.logger.log(`Found ${hits.length} hits`)

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
        const name = foundLang === Lang.Thai ? hit._source.name_th : hit._source.name_en
        const trackDto = TrackSearchDto.toDto({
            ...hit._source,
        })

        trackDto.name = name
        return trackDto
    }

    private getArtistSearchDto(hit: SearchHit<ArtistES>, foundLang: string = Lang.Thai): ArtistSearchDto {
        const name = foundLang === Lang.Thai ? hit._source.name_th : hit._source.name_en

        const artistDto = ArtistSearchDto.toDto({
            ...hit._source,
        })

        artistDto.name = name
        return artistDto
    }

    private getAlbumSearchDto(hit: SearchHit<AlbumES>, foundLang: string = Lang.Thai): AlbumSearchDto {
        const name = foundLang === Lang.Thai ? hit._source.name_th : hit._source.name_en

        const albumDto = AlbumSearchDto.toDto({
            ...hit._source,
        })

        albumDto.name = name
        return albumDto
    }

    public getNewTracks(): Observable<ListResponse<TrackSearchDto>> {
        return this.trackRepository.getNewTracks().pipe(
            map((response) => {
                return response.hits.hits.map((hit) => {
                    const track = hit._source as TrackES
                    return TrackSearchDto.toDto(track, {
                        name: track.name_th,
                    })
                })
            }),
            map((tracks) => {
                const listResponse = new ListResponse<TrackSearchDto>()
                listResponse.data = tracks
                listResponse.total = tracks.length
                listResponse.page = 1
                listResponse.limit = 999

                return listResponse
            }),
            catchError((err) => {
                this.logger.error(`Error getting new tracks: ${err}`)
                throw err
            }),
        )
    }

    public getTopTracks(): Observable<ListResponse<TrackSearchDto>> {
        return this.trackRepository.getTopTracks().pipe(
            map((response) => {
                return response.hits.hits.map((hit) => {
                    const track = hit._source as TrackES
                    return TrackSearchDto.toDto(track, {
                        name: track.name_th,
                    })
                })
            }),
            map((tracks) => {
                const listResponse = new ListResponse<TrackSearchDto>()
                listResponse.data = tracks
                listResponse.total = tracks.length
                listResponse.page = 1
                listResponse.limit = 999

                return listResponse
            }),
            catchError((err) => {
                this.logger.error(`Error getting top tracks: ${err}`)
                throw err
            }),
        )
    }
}

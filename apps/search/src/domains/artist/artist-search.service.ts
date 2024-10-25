import { SearchTotalHits } from '@elastic/elasticsearch/lib/api/types'
import { ProviderName } from '@libs/common/constants'
import { TrackElasticRepository } from '@libs/repositories/elasticsearch/track.elastic.repository'
import { ArtistES } from '@libs/repositories/interfaces/search/artist.interface'
import { Inject, Logger } from '@nestjs/common'
import { catchError, map, Observable } from 'rxjs'
import { AlbumSearchDto } from '../track/dtos/album.dto'
import { ArtistSearchDto } from './dtos/artist.dto'
import { IArtistService } from './interfaces/service.interface'

export class SearchArtistService implements IArtistService {
    private readonly logger = new Logger(SearchArtistService.name)
    constructor(
        // TODO:: เก็บไว้คุยว่าควรออกแบบยังไงดี ตั้งชื่อยังไงดี เพราะทุกอย่างอยู่ใน indice เดียวกัน
        @Inject(ProviderName.TRACK_REPOSITORY)
        private trackRepository: TrackElasticRepository,
    ) {}

    public searchArtistById(id: number): Observable<ArtistSearchDto> {
        if (!id) {
            throw new Error('id is required')
        }

        return this.trackRepository.searchArtistById(id).pipe(
            map((response) => {
                if ((response.hits.total as SearchTotalHits).value === 0) {
                    throw new Error('Artist not found')
                }

                return response.hits.hits[0]._source.artist as ArtistES
            }),
            map((artist) => {
                return ArtistSearchDto.toDto(artist)
            }),
            catchError((err) => {
                this.logger.error(`Error searching artist by id: ${err}`)
                throw err
            }),
        )
    }

    public searchAlbumsByArtistId(id: number): Observable<AlbumSearchDto[]> {
        if (!id) {
            throw new Error('artist id is required')
        }

        return this.trackRepository.searchAlbumsByArtistId(id).pipe(
            map((response) => {
                if ((response.hits.total as SearchTotalHits).value === 0) {
                    throw new Error('Albums not found')
                }

                return response.hits.hits.map((album) => {
                    return AlbumSearchDto.toDto(album._source.album)
                })
            }),
            catchError((err) => {
                this.logger.error(`Error searching albums by artist id: ${err}`)
                throw err
            }),
        )
    }
}

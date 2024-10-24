import { SearchHit, SearchTotalHits } from '@elastic/elasticsearch/lib/api/types'
import { ProviderName } from '@libs/common/constants'
import { ListResponse } from '@libs/common/models'
import { TrackElasticRepository } from '@libs/repositories/elasticsearch/track.elastic.repository'
import { TrackES } from '@libs/repositories/interfaces/search/track.interface'
import { Inject, Logger } from '@nestjs/common'
import { catchError, map, Observable } from 'rxjs'
import { AlbumDto, AlbumSearchDto } from './dtos/album.dto'
import { ArtistDto, ArtistSearchDto } from './dtos/artist.dto'
import { TrackSearchDto } from './dtos/track.dto'
import { SearchSuggestionResponse } from './interfaces/search-all.interface'
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
            'title_th',
            'title_en',
            'aliases',
            'artist.name',
            'album.title',
            // 'genres.name',
            // 'playlists.name',
        ]

        return this.trackRepository
            .search(keyword, fields, {
                limit,
                page,
            })
            .pipe(
                map((response) => {
                    // Get hits from elastic response
                    const hits = response.hits.hits

                    this.logger.log(`Found ${hits.length} hits`)

                    const matchQueries = {
                        titleTh: 'title_th',
                        titleEn: 'title_en',
                        aliases: 'aliases',
                        artist: 'artist_name',
                        album: 'album_title',
                        // genre: 'genres_name',
                        // playlist: 'playlists_name',
                    }

                    const found: (TrackSearchDto | ArtistSearchDto | AlbumSearchDto)[] = hits
                        .map((hit): (TrackSearchDto | ArtistSearchDto | AlbumSearchDto)[] => {
                            this.logger.log(`Matched queries: ${hit.matched_queries}`)
                            if (hit.matched_queries && hit.matched_queries.length > 0) {
                                let _found: (TrackSearchDto | ArtistSearchDto | AlbumSearchDto)[] = []
                                hit.matched_queries.forEach((matched) => {
                                    switch (matched) {
                                        case matchQueries.titleTh:
                                        case matchQueries.titleEn:
                                        case matchQueries.aliases:
                                            _found.push(this.getTrackDto(hit))
                                            break
                                        case matchQueries.artist:
                                            _found.push(this.getArtistDto(hit))
                                            break
                                        case matchQueries.album:
                                            _found.push(this.getAlbumDto(hit))
                                            break
                                    }
                                })
                                return _found
                            }
                            return []
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

    public getSuggestion(keyword: string): Observable<ListResponse<SearchSuggestionResponse>> {
        const fields = [
            'title_th',
            'title_en',
            'aliases',
            'artist.name',
            'album.title',
            'genres.name',
            'playlists.name',
        ]

        return this.trackRepository
            .search(keyword, fields, {
                limit: 20,
                page: 1,
            })
            .pipe(
                map((response) => {
                    // Get hits from elastic response
                    const hits = response.hits.hits

                    this.logger.log(`Found ${hits.length} hits`)

                    const matchQueries = {
                        titleTh: 'title_th',
                        titleEn: 'title_en',
                        aliases: 'aliases',
                        artist: 'artist_name',
                        album: 'album_title',
                        genre: 'genres_name',
                        playlist: 'playlists_name',
                    }

                    const found: string[] = hits
                        .map((hit): string[] => {
                            this.logger.log(`Matched queries: ${hit.matched_queries}`)
                            if (hit.matched_queries && hit.matched_queries.length > 0) {
                                let _found = []
                                hit.matched_queries.forEach((matched) => {
                                    switch (matched) {
                                        case matchQueries.titleTh:
                                            _found.push(hit.highlight.title_th || '')
                                            break
                                        case matchQueries.titleEn:
                                            _found.push(hit.highlight.title_en || '')
                                            break
                                        case matchQueries.aliases:
                                            _found.push(this.gethighlightedTitles(hit))
                                            break
                                        case matchQueries.artist:
                                            _found.push(hit.highlight['artists.name'] || '')
                                            break
                                        case matchQueries.album:
                                            _found.push(hit.highlight['album.title'] || '')
                                            break
                                        case matchQueries.genre:
                                            _found.push(this.gethighlightedTitles(hit))
                                            break
                                        case matchQueries.playlist:
                                            _found.push(this.gethighlightedTitles(hit))
                                            break
                                    }
                                })
                                return _found
                            }
                            return []
                        })
                        .flat(2)

                    const resData: SearchSuggestionResponse = {
                        keywords: found,
                    }

                    const listResponse = new ListResponse<SearchSuggestionResponse>()
                    listResponse.data = [
                        resData,
                    ]
                    listResponse.total = (response.hits.total as SearchTotalHits).value
                    listResponse.page = 1
                    listResponse.limit = 20

                    return listResponse
                }),
                catchError((err) => {
                    this.logger.error(`Error searching suggestion: ${err}`)
                    throw err
                }),
            )
    }

    private getTitles(hit: SearchHit<TrackES>): string {
        return hit._source.title_th || hit._source.title_en || ''
    }

    private gethighlightedTitles(hit: SearchHit<TrackES>): string | string[] {
        return hit.highlight.title_th || hit.highlight.title_en || ''
    }

    private getTrackDto(hit: SearchHit<TrackES>, foundLang: string = 'th'): TrackSearchDto {
        const title = foundLang === 'th' ? hit._source.title_th : hit._source.title_en
        const trackDto = TrackSearchDto.toDto({
            ...hit._source,
            // highlights: hit.highlight,
        })

        trackDto.title = title
        return trackDto
    }

    private getArtistDto(hit: SearchHit<TrackES>): ArtistDto {
        return ArtistDto.toDto({
            ...hit._source.artist,
            // highlights: hit.highlight,
        })
    }

    private getAlbumDto(hit: SearchHit<TrackES>): AlbumDto {
        return AlbumDto.toDto({
            ...hit._source.album,
            // highlights: hit.highlight,
        })
    }
}

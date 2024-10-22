import { SearchHit, SearchTotalHits } from '@elastic/elasticsearch/lib/api/types'
import { ProviderName } from '@libs/common/constants'
import { ListResponse } from '@libs/common/models'
import { TrackElasticRepository } from '@libs/repositories/elasticsearch/track.elastic.repository'
import { TrackES } from '@libs/repositories/interfaces/search/track.interface'
import { Inject, Logger } from '@nestjs/common'
import { Observable } from 'rxjs'
import { AlbumDto } from './dtos/album.dto'
import { ArtistDto } from './dtos/artist.dto'
import { TrackDto } from './dtos/track.dto'
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
    ): Observable<ListResponse<TrackDto | ArtistDto | AlbumDto>> {
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

        return new Observable((observer) => {
            this.trackRepository
                .search(keyword, fields, {
                    limit,
                    page,
                })
                .subscribe({
                    next: (response) => {
                        // Get hits from elastic response
                        const hits = response.hits.hits

                        this.logger.log(`Found ${hits.length} hits`)

                        // เราใช้ concept named_query บน elasticsearch มันจะบอกว่า query ไหนที่ match กับข้อมูล
                        // แล้วเราก็จะใช้ข้อมูลนั้นมาแสดงผล

                        const matchQueries = {
                            titleTh: 'title_th',
                            titleEn: 'title_en',
                            aliases: 'aliases',
                            artist: 'artist_name',
                            album: 'album_title',
                            // genre: 'genres_name',
                            // playlist: 'playlists_name',
                        }

                        // เช็คว่า match กับ query ไหนบ้าง แล้วเอาข้อมูลทั้งหมดมาแสดง
                        // เช่น ถ้าเจอทั้งใน title_th และ album.title ก็จะแสดงหมด
                        // ก็เลยมีพวก .flat(2) มาเพื่อให้ข้อมูลเป็น array 1 ระดับ
                        const found: (TrackDto | ArtistDto | AlbumDto)[] = hits
                            .map((hit): (TrackDto | ArtistDto | AlbumDto)[] => {
                                this.logger.log(`Matched queries: ${hit.matched_queries}`)
                                if (hit.matched_queries && hit.matched_queries.length > 0) {
                                    let _found: (TrackDto | ArtistDto | AlbumDto)[] = []
                                    hit.matched_queries.forEach((matched) => {
                                        // get normal text
                                        switch (matched) {
                                            case matchQueries.titleTh:
                                                // Get title from _source
                                                _found.push(this.getTrackDto(hit))
                                                break
                                            case matchQueries.titleEn:
                                                _found.push(this.getTrackDto(hit))
                                                break
                                            case matchQueries.aliases:
                                                _found.push(this.getTrackDto(hit))
                                                break
                                            case matchQueries.artist:
                                                _found.push(this.getArtistDto(hit))
                                                break
                                            case matchQueries.album:
                                                _found.push(this.getAlbumDto(hit))
                                                break
                                            // case matchQueries.genre:
                                            //     _found.push(this.getTrackDto(hit))
                                            //     break
                                            // case matchQueries.playlist:
                                            //     _found.push(this.getTrackDto(hit))
                                            //     break
                                        }
                                    })

                                    return _found
                                }
                            })
                            .flat(2)

                        const listResponse = new ListResponse<TrackDto | ArtistDto | AlbumDto>()
                        listResponse.data = found
                        listResponse.total = (response.hits.total as SearchTotalHits).value
                        listResponse.page = page
                        listResponse.limit = limit

                        observer.next(listResponse)
                        observer.complete() // Ensure the observable completes
                    },
                    error: (err) => {
                        // Handle error
                        observer.error(err)
                    },
                })
        })
    }

    public getSuggestion(keyword: string): Observable<ListResponse<SearchSuggestionResponse>> {
        return new Observable((observer) => {
            const fields = [
                'title_th',
                'title_en',
                'aliases',
                'artist.name',
                'album.title',
                'genres.name',
                'playlists.name',
            ]

            this.trackRepository
                .search(keyword, fields, {
                    limit: 20,
                    page: 1,
                })
                .subscribe({
                    next: (response) => {
                        // Get hits from elastic response
                        const hits = response.hits.hits

                        this.logger.log(`Found ${hits.length} hits`)

                        // เราใช้ concept named_query บน elasticsearch มันจะบอกว่า query ไหนที่ match กับข้อมูล
                        // แล้วเราก็จะใช้ข้อมูลนั้นมาแสดงผล

                        const matchQueries = {
                            titleTh: 'title_th',
                            titleEn: 'title_en',
                            aliases: 'aliases',
                            artist: 'artist_name',
                            album: 'album_title',
                            genre: 'genres_name',
                            playlist: 'playlists_name',
                        }

                        // เช็คว่า match กับ query ไหนบ้าง แล้วเอาข้อมูลทั้งหมดมาแสดง
                        // เช่น ถ้าเจอทั้งใน title_th และ album.title ก็จะแสดงหมด
                        // ก็เลยมีพวก .flat(2) มาเพื่อให้ข้อมูลเป็น array 1 ระดับ
                        const found: string[] = hits
                            .map((hit): string[] => {
                                this.logger.log(`Matched queries: ${hit.matched_queries}`)
                                if (hit.matched_queries && hit.matched_queries.length > 0) {
                                    let _found = []
                                    hit.matched_queries.forEach((matched) => {
                                        // get highlighted text
                                        switch (matched) {
                                            case matchQueries.titleTh:
                                                // Get title from _source
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

                                        // get normal text
                                        // switch (matched) {
                                        //     case matchQueries.titleTh:
                                        //         // Get title from _source
                                        //         _found.push(hit._source.title_th || '')
                                        //         break
                                        //     case matchQueries.titleEn:
                                        //         _found.push(hit._source.title_en || '')
                                        //         break
                                        //     case matchQueries.aliases:
                                        //         _found.push(this.getTitles(hit)))
                                        //         break
                                        //     case matchQueries.artist:
                                        //         _found.push(hit._source.artists.name || '')
                                        //         break
                                        //     case matchQueries.album:
                                        //         _found.push(hit._source.album.title || '')
                                        //         break
                                        //     case matchQueries.genre:
                                        //         _found.push(this.getTitles(hit)))
                                        //         break
                                        //     case matchQueries.playlist:
                                        //         _found.push(this.getTitles(hit)))
                                        //         break
                                        // }
                                    })

                                    return _found
                                }
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

                        observer.next(listResponse)
                        observer.complete() // Ensure the observable completes
                    },
                    error: (err) => {
                        this.logger.error(`Error searching suggestion: ${err}`)
                        // Handle error
                        observer.error(err)
                    },
                    complete: () => {
                        this.logger.log('Search suggestion completed')
                        observer.complete()
                    },
                })
        })
    }

    private getTitles(hit: SearchHit<TrackES>): string {
        return hit._source.title_th || hit._source.title_en || ''
    }

    private gethighlightedTitles(hit: SearchHit<TrackES>): string | string[] {
        return hit.highlight.title_th || hit.highlight.title_en || ''
    }

    private getTrackDto(hit: SearchHit<TrackES>): TrackDto {
        return TrackDto.toDto(hit._source)
    }

    private getArtistDto(hit: SearchHit<TrackES>): ArtistDto {
        return ArtistDto.toDto(hit._source.artist)
    }

    private getAlbumDto(hit: SearchHit<TrackES>): AlbumDto {
        return AlbumDto.toDto(hit._source.album)
    }
}

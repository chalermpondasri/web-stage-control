import { Controller, Get, Logger, Param, Query } from '@nestjs/common'
import { ApiOperation, ApiProperty } from '@nestjs/swagger'
import { SearchAlbumService } from '../domains/album/album-search.service'
import { SearchArtistService } from '../domains/artist/artist-search.service'
import { SearchTracksRequest } from '../domains/track/dtos/track.dto'
import { SearchTrackService } from '../domains/track/track-search.service'

@Controller('/search')
export class SearchController {
    private readonly _logger: Logger = new Logger(SearchController.name)

    public constructor(
        private readonly _trackSearchService: SearchTrackService,
        private readonly _artistSearchService: SearchArtistService,
        private readonly _albumSearchService: SearchAlbumService,
    ) {}
    @ApiOperation({
        description: 'Search track by keyword',
    })
    @ApiProperty({
        type: SearchTracksRequest,
        description: 'Search track by keyword',
    })
    @Get('/track')
    public getTracksByKeyword(@Query() searchTracksRequest: SearchTracksRequest) {
        return this._trackSearchService.searchTracksByKeyword(
            searchTracksRequest.keyword,
            searchTracksRequest.page,
            searchTracksRequest.limit,
        )
    }

    @ApiOperation({
        description: 'Get Top Artist',
    })
    @Get('/artist/top')
    public getTopArtist() {
        return this._artistSearchService.getTopArtist()
    }

    @ApiOperation({
        description: 'Get new tracks sorted by releaseDate',
    })
    @ApiProperty({
        description: 'New Tracks',
    })
    @Get('/track/new')
    public getNewTracks() {
        return this._trackSearchService.getNewTracks()
    }

    @ApiOperation({
        description: 'Get Top tracks',
    })
    @ApiProperty({
        description: 'Top Tracks',
    })
    @Get('/track/top')
    public getTopTracks() {
        return this._trackSearchService.getTopTracks()
    }

    @ApiOperation({
        description: "Get top albums based on sum of track's hitCounts",
    })
    @Get('/album/top')
    public getTopAlbums() {
        return this._albumSearchService.getTopAlbums()
    }

    @ApiOperation({
        description: 'Get album by id',
    })
    @ApiProperty({
        description: 'The id of the album',
        default: '1',
    })
    @Get('/album/:id')
    public getAlbumById(@Param('id') id: string) {
        return this._albumSearchService.searchAlbumById(Number(id))
    }

    @ApiOperation({
        description: 'Get artist by id',
    })
    @ApiProperty({
        description: 'The id of the artist',
        default: '1',
    })
    @Get('/artist/:id')
    public getArtistById(@Param('id') id: string) {
        return this._artistSearchService.searchArtistById(Number(id))
    }
}

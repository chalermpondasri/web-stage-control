import { Controller, Get, Logger, Query } from '@nestjs/common'
import { ApiExtraModels, ApiOkResponse, ApiOperation, ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { AlbumDto } from '../domains/track/dtos/album.dto'
import { ArtistDto } from '../domains/track/dtos/artist.dto'
import { SearchSuggestionRequest } from '../domains/track/dtos/search-all.dto'
import { SearchTracksRequest, TrackDto } from '../domains/track/dtos/track.dto'
import { SearchTrackService } from '../domains/track/track-search.service'

@Controller('/search')
export class SearchController {
    private readonly _logger: Logger = new Logger(SearchController.name)

    public constructor(private readonly _trackSearchService: SearchTrackService) {}

    @ApiOperation({
        description: 'Search suggestions by keyword',
    })
    @ApiProperty({
        type: SearchSuggestionRequest,
        description: 'Search suggestions by keyword',
    })
    @Get('/suggestions')
    public getSuggestionsByKeyword(@Query('keyword') keyword: string) {
        return this._trackSearchService.getSuggestion(keyword)
    }

    @ApiOperation({
        description: 'Search track by keyword',
    })
    @ApiProperty({
        type: SearchTracksRequest,
        description: 'Search track by keyword',
    })
    @ApiExtraModels(TrackDto)
    @ApiExtraModels(AlbumDto)
    @ApiExtraModels(ArtistDto)
    @ApiOkResponse({
        schema: {
            type: 'object',
            properties: {
                total: { type: 'number' },
                limit: { type: 'number' },
                page: { type: 'number' },
                data: {
                    type: 'array',
                    items: {
                        oneOf: [
                            { $ref: getSchemaPath(TrackDto) },
                            { $ref: getSchemaPath(AlbumDto) },
                            { $ref: getSchemaPath(ArtistDto) },
                        ],
                    },
                },
            },
        },
        description: 'Search track by keyword',
    })
    @Get('/track')
    public getTracksByKeyword(
        // @Query('keyword') keyword: string,
        // @Query('page') page: number,
        // @Query('limit') limit: number,
        @Query() searchTracksRequest: SearchTracksRequest,
    ) {
        return this._trackSearchService.searchTracksByKeyword(
            searchTracksRequest.keyword,
            searchTracksRequest.page,
            searchTracksRequest.limit,
        )
    }
}

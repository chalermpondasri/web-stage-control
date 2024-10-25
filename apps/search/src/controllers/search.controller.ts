import { Controller, Get, Logger, Param, Query } from '@nestjs/common'
import { ApiExtraModels, ApiOkResponse, ApiOperation, ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { SearchArtistService } from '../domains/artist/artist-search.service'
import { ArtistDto } from '../domains/artist/dtos/artist.dto'
import { AlbumDto } from '../domains/track/dtos/album.dto'
import { SearchSuggestionRequest } from '../domains/track/dtos/search-all.dto'
import { SearchTracksRequest, TrackSearchDto } from '../domains/track/dtos/track.dto'
import { SearchTrackService } from '../domains/track/track-search.service'

@Controller('/search')
export class SearchController {
    private readonly _logger: Logger = new Logger(SearchController.name)

    public constructor(
        private readonly _trackSearchService: SearchTrackService,
        private readonly _artistSearchService: SearchArtistService,
    ) {}

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
    @ApiExtraModels(TrackSearchDto)
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
                            { $ref: getSchemaPath(TrackSearchDto) },
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
    public getTracksByKeyword(@Query() searchTracksRequest: SearchTracksRequest) {
        return this._trackSearchService.searchTracksByKeyword(
            searchTracksRequest.keyword,
            searchTracksRequest.page,
            searchTracksRequest.limit,
        )
    }

    @ApiOperation({
        description: 'Get artist by id',
    })
    @ApiProperty({
        description: 'The id of the artist',
        default: '1',
    })
    @ApiExtraModels(ArtistDto)
    @ApiOkResponse({
        schema: {
            type: 'object',
            properties: {
                total: { type: 'number' },
                limit: { type: 'number' },
                page: { type: 'number' },
                data: { $ref: getSchemaPath(ArtistDto) },
            },
        },
        description: 'Search track by keyword',
    })
    @Get('/artist/:id')
    public getArtistById(@Param('id') id: string) {
        // TODO:: update fields ที่จะ return เช็คกับหน้าบ้าน
        return this._artistSearchService.searchArtistById(Number(id))
    }

    @ApiOperation({
        description: 'Get album by artist id',
    })
    @ApiProperty({
        description: 'The id of the artist',
        default: '1',
    })
    @Get('/artist/:id/albums')
    public getAlbumByArtistId(@Param('id') id: string) {
        return this._artistSearchService.searchAlbumsByArtistId(Number(id))
    }
}

import { Controller, Get, Logger, Query } from '@nestjs/common'
import { ApiOperation, ApiProperty } from '@nestjs/swagger'
import { SearchSuggestionRequest } from '../domains/track/dtos/search-all.dto'
import { SearchTrackService } from '../domains/track/track-search.service'

@Controller('/search')
export class SearchController {
    private readonly _logger: Logger = new Logger(SearchController.name)

    public constructor(private readonly _trackSearchService: SearchTrackService) {}

    @ApiOperation({
        description: 'Search track by keyword',
    })
    @ApiProperty({
        type: SearchSuggestionRequest,
        description: 'Search track by keyword',
    })
    @Get('/suggestions')
    public(@Query('keyword') keyword: string) {
        return this._trackSearchService.getSuggestion(keyword)
    }
}

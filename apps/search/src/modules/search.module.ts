import { Module } from '@nestjs/common'
import { SearchController } from '../controllers/search.controller'
import { SearchTrackService } from '../domains/track/track-search.service'

@Module({
    providers: [
        SearchTrackService,
    ],
    controllers: [
        SearchController,
    ],
})
export class SearchModule {}

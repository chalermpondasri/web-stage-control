import { Module } from '@nestjs/common'
import { SearchController } from '../controllers/search.controller'
import { SearchAlbumService } from '../domains/album/album-search.service'
import { SearchArtistService } from '../domains/artist/artist-search.service'
import { SearchTrackService } from '../domains/track/track-search.service'

@Module({
    providers: [
        SearchTrackService,
        SearchArtistService,
        SearchAlbumService,
    ],
    controllers: [
        SearchController,
    ],
})
export class SearchModule {}

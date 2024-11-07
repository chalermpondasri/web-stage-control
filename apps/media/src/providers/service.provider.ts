import { ProviderName } from '@libs/common/constants'
import { Repository } from 'typeorm'
import { Community } from '@libs/entities/community.entity'
import { PlaylistService } from '../services/playlist.service'
import { Playlist } from '@libs/entities/playlist.entity'
import { StrapiClient } from '@libs/providers/strapi-client.provider'

export const playlistServiceProvider = {
    provide: ProviderName.PLAYLIST_SERVICE,
    inject: [
        ProviderName.COMMUNITY_REPOSITORY,
        ProviderName.PLAYLIST_REPOSITORY,
    ],
    useFactory: (
        communityRepository: Repository<Community>,
        playlistRepository: Repository<Playlist>,
        strapiClient: StrapiClient
        ) => {
        return new PlaylistService(
            communityRepository,
            playlistRepository,
            strapiClient,
        )
    }
}
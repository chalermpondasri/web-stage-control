import { ProviderName } from '@libs/common/constants'
import { Repository } from 'typeorm'
import { Community } from '@libs/entities/community.entity'
import { PlaylistService } from '../services/playlist.service'

export const playlistServiceProvider = {
    provide: ProviderName.PLAYLIST_SERVICE,
    inject: [
        ProviderName.COMMUNITY_REPOSITORY,
    ],
    useFactory: (communityRepository: Repository<Community>) => {
        return new PlaylistService(communityRepository)
    }
}
import { ProviderName } from '@libs/common/constants'
import { Repository } from 'typeorm'
import { Community } from '@libs/entities/community.entity'
import { PlaylistService } from '../services/playlist.service'
import { Playlist } from '@libs/entities/playlist.entity'
import { StrapiClient } from '@libs/providers/strapi-client.provider'
import { BoostService } from '../services/boost.service'
import { RequestContext } from '@libs/providers/request-context.provider'
import { User } from '@libs/entities/user.entity'
import { TrackElasticRepository } from '@libs/repositories/elasticsearch/track.elastic.repository'
import { EventSubjectFactory } from '@libs/providers/event-subject.provider'
import { AlbumElasticRepository } from '@libs/repositories/elasticsearch/album.elastic.repository'

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

export const boostServiceProvider = {
    provide: ProviderName.BOOST_SERVICE,
    inject: [
        ProviderName.STRAPI_CLIENT,
        ProviderName.REQUEST_CONTEXT,
        ProviderName.USER_REPOSITORY,
        ProviderName.PLAYLIST_REPOSITORY,
        ProviderName.TRACK_REPOSITORY,
        ProviderName.SSE_EVENT_SUBJECT_FACTORY,
        ProviderName.ALBUM_REPOSITORY,
    ],
    useFactory: (
        client: StrapiClient,
        requestContext: RequestContext,
        userRepository: Repository<User>,
        playlistRepository: Repository<Playlist>,
        trackElasticRepository: TrackElasticRepository,
        eventSubject: EventSubjectFactory,
        albumElasticRepository: AlbumElasticRepository,
    ) => {
        return new BoostService(
            client,
            requestContext,
            userRepository,
            playlistRepository,
            trackElasticRepository,
            eventSubject,
            albumElasticRepository,
            )
    }
}
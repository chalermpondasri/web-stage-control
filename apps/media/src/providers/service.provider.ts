import { ProviderName } from '@libs/common/constants'
import { Repository } from 'typeorm'
import { Community } from '@libs/entities/community.entity'
import { PlaylistService } from '../services/playlist.service'
import {
    PlayedMedia,
    Playlist,
} from '@libs/entities/playlist.entity'
import { StrapiClient } from '@libs/providers/strapi-client.provider'
import { BoostService } from '../services/boost.service'
import { RequestContext } from '@libs/providers/request-context.provider'
import { User } from '@libs/entities/user.entity'
import { TrackElasticRepository } from '@libs/repositories/elasticsearch/track.elastic.repository'
import { EventSubjectFactory } from '@libs/providers/event-subject.provider'
import { AlbumElasticRepository } from '@libs/repositories/elasticsearch/album.elastic.repository'
import { StageService } from '../services/stage.service'
import { Stage } from '@libs/entities/stage.entity'
import { ITokenizationService } from '@libs/providers/tokenization/tokenization-service.interface'
import { Provider } from '@nestjs/common'
import { MediaService } from '../services/media.service'
import { CoinDeduction } from '@libs/entities/coin-deduction.entity'
import { AdsService } from '../services/ads.service'
import { ICacheService } from '@libs/providers/redis'
import { IAdsService } from '../services/interfaces/service.interface'
import { IDiscordAdapter } from '@libs/utilities/adapter/interface/adapter.interface'
import { BackdropService } from '../services/backdrop.service'

export const playlistServiceProvider = {
    provide: ProviderName.PLAYLIST_SERVICE,
    inject: [
        ProviderName.COMMUNITY_REPOSITORY,
        ProviderName.PLAYLIST_REPOSITORY,
    ],
    useFactory: (
        communityRepository: Repository<Community>,
        playlistRepository: Repository<Playlist>,
        strapiClient: StrapiClient,
    ) => {
        return new PlaylistService(
            communityRepository,
            playlistRepository,
            strapiClient,
        )
    },
}

export const boostServiceProvider: Provider = {
    provide: ProviderName.BOOST_SERVICE,
    inject: [
        ProviderName.REQUEST_CONTEXT,
        ProviderName.USER_REPOSITORY,
        ProviderName.PLAYLIST_REPOSITORY,
        ProviderName.TRACK_REPOSITORY,
        ProviderName.SSE_PLAYLIST_SUBJECT_FACTORY,
        ProviderName.ALBUM_REPOSITORY,
        ProviderName.COIN_DEDUCTION_REPOSITORY,
    ],
    useFactory: (
        requestContext: RequestContext,
        userRepository: Repository<User>,
        playlistRepository: Repository<Playlist>,
        trackElasticRepository: TrackElasticRepository,
        eventSubject: EventSubjectFactory,
        albumElasticRepository: AlbumElasticRepository,
        coinDeductionRepository: Repository<CoinDeduction>,
    ) => {
        return new BoostService(
            requestContext,
            userRepository,
            playlistRepository,
            trackElasticRepository,
            eventSubject,
            albumElasticRepository,
            coinDeductionRepository,
        )
    },
}

export const stageServiceProvider = {
    provide: ProviderName.STAGE_SERVICE,
    inject: [
        ProviderName.STAGE_REPOSITORY,
        ProviderName.TOKENIZATION_SERVICE,
        ProviderName.SSE_PLAYLIST_SUBJECT_FACTORY,
        ProviderName.PLAYLIST_REPOSITORY,
        ProviderName.PLAYED_MEDIA_REPOSITORY,
        ProviderName.CACHE_SERVICE,
        ProviderName.ADS_SERVICE,
        ProviderName.LOGGING_DISCORD,
    ],
    useFactory: (
        stageRepository: Repository<Stage>,
        tokenizationService: ITokenizationService,
        playlistSubject: EventSubjectFactory,
        playlistRepository: Repository<Playlist>,
        playedMediaRepository: Repository<PlayedMedia>,
        cacheService: ICacheService,
        adsService: IAdsService,
        loggingDiscord: IDiscordAdapter,
    ) => {
        return new StageService(
            stageRepository,
            tokenizationService,
            playlistSubject,
            playlistRepository,
            playedMediaRepository,
            cacheService,
            adsService,
            loggingDiscord,
        )
    },
}

export const mediaServiceProvider: Provider = {
    provide: ProviderName.MEDIA_SERVICE,
    inject: [
        ProviderName.STRAPI_CLIENT,
    ],
    useFactory: (client: StrapiClient) => {
        return new MediaService(
            client,
        )
    },
}

export const adsServiceProvider: Provider = {
    provide: ProviderName.ADS_SERVICE,
    inject: [
        ProviderName.STRAPI_CLIENT,
    ],
    useFactory: (strapiClient: StrapiClient) =>  {
        return new AdsService(strapiClient)
    }
}
export const backdropServiceProvider: Provider = {
    provide: ProviderName.BACKDROP_SERVICE,
    inject: [
        ProviderName.STRAPI_CLIENT,
    ],
    useFactory: (
      client: StrapiClient,
    )=> {
        return new BackdropService(client)
    }
}

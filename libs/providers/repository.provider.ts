import { Client } from '@elastic/elasticsearch'
import { ProviderName } from '@libs/common/constants/providerName'
import { EnvironmentConfig } from '@libs/common/models'
import { Admin } from '@libs/entities/admin.entity'
import { Broadcast } from '@libs/entities/broadcast.entity'
import { Community } from '@libs/entities/community.entity'
import { User } from '@libs/entities/user.entity'
import { Voucher } from '@libs/entities/voucher.entity'
import { AlbumElasticRepository } from '@libs/repositories/elasticsearch/album.elastic.repository'
import { ArtistElasticRepository } from '@libs/repositories/elasticsearch/artist.elastic.repository'
import { TrackElasticRepository } from '@libs/repositories/elasticsearch/track.elastic.repository'
import { LineRepository } from '@libs/repositories/line.repository'
import { Provider } from '@nestjs/common'
import { AxiosInstance } from 'axios'
import { DataSource } from 'typeorm'
import {
    PlayedMedia,
    Playlist,
} from '@libs/entities/playlist.entity'
import { Payment } from '@libs/entities/payment.entity'
import { Stage } from '@libs/entities/stage.entity'
import { Transaction } from '@libs/entities/transaction.entity'
import { CoinDeduction } from '@libs/entities/coin-deduction.entity'

export const ormRepositoryProviders: Provider[] = [
    {
        provide: ProviderName.USER_REPOSITORY,
        inject: [
            ProviderName.ORM_DATASOURCE,
        ],
        useFactory: (ds: DataSource) => ds.getRepository(User),
    },
    {
        provide: ProviderName.ADMIN_REPOSITORY,
        inject: [
            ProviderName.ORM_DATASOURCE,
        ],
        useFactory: (ds: DataSource) => ds.getRepository(Admin),
    },
    {
        provide: ProviderName.COMMUNITY_REPOSITORY,
        inject: [
            ProviderName.ORM_DATASOURCE,
        ],
        useFactory: (ds: DataSource) => ds.getRepository(Community),
    },
    {
        provide: ProviderName.PLAYLIST_REPOSITORY,
        inject: [
            ProviderName.ORM_DATASOURCE,
        ],
        useFactory: (ds: DataSource) => ds.getRepository(Playlist),
    },
    {
        provide: ProviderName.BROADCAST_REPOSITORY,
        inject: [
            ProviderName.ORM_DATASOURCE,
        ],
        useFactory: (ds: DataSource) => ds.getRepository(Broadcast),
    },
    {
        provide: ProviderName.PAYMENT_REPOSITORY,
        inject: [
            ProviderName.ORM_DATASOURCE,
        ],
        useFactory: (ds: DataSource) => ds.getRepository(Payment),
    },
    {
        provide: ProviderName.VOUCHER_REPOSITORY,
        inject: [
            ProviderName.ORM_DATASOURCE,
        ],
        useFactory: (ds: DataSource) => ds.getRepository(Voucher),
    },
    {
        provide: ProviderName.STAGE_REPOSITORY,
        inject: [
            ProviderName.ORM_DATASOURCE,
        ],
        useFactory: (ds: DataSource) => ds.getRepository(Stage),
    },
    {
        provide: ProviderName.PLAYED_MEDIA_REPOSITORY,
        inject: [
            ProviderName.ORM_DATASOURCE,
        ],
        useFactory: (ds: DataSource) => ds.getRepository(PlayedMedia),
    },
    {
        provide: ProviderName.TRANSACTION_REPOSITORY,
        inject: [
            ProviderName.ORM_DATASOURCE,
        ],
        useFactory: (ds: DataSource) => ds.getRepository(Transaction),
    },
    {
        provide: ProviderName.COIN_DEDUCTION_REPOSITORY,
        inject: [
            ProviderName.ORM_DATASOURCE,
        ],
        useFactory: (ds: DataSource) => ds.getRepository(CoinDeduction),
    }
]

export const lineRepositoryProvider: Provider = {
    provide: ProviderName.LINE_REPOSITORY,
    inject: [
        ProviderName.HTTP_CLIENT,
        ProviderName.ENV_CONFIG,
    ],
    useFactory: (client: AxiosInstance, config: EnvironmentConfig) => {
        return new LineRepository(client, config)
    },
}

export const elasticRepositoryProviders: Provider[] = [
    {
        provide: ProviderName.TRACK_REPOSITORY,
        inject: [
            ProviderName.ELASTIC_CLIENT,
        ],
        useFactory: async (client: Client) => {
            return new TrackElasticRepository(client)
        },
    },
    {
        provide: ProviderName.ALBUM_REPOSITORY,
        inject: [
            ProviderName.ELASTIC_CLIENT,
        ],
        useFactory: async (client: Client) => {
            return new AlbumElasticRepository(client)
        },
    },
    {
        provide: ProviderName.ARTIST_REPOSITORY,
        inject: [
            ProviderName.ELASTIC_CLIENT,
        ],
        useFactory: async (client: Client) => {
            return new ArtistElasticRepository(client)
        },
    },
]

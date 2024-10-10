import { Client } from '@elastic/elasticsearch'
import { ProviderName } from '@libs/common/constants/providerName'
import { EnvironmentConfig } from '@libs/common/models'
import { Admin } from '@libs/entities/admin.entity'
import { Community } from '@libs/entities/community.entity'
import { Content } from '@libs/entities/content.entity'
import { User } from '@libs/entities/user.entity'
import { ElasticsearchRepository } from '@libs/repositories/elasticsearch/elasticsearch.repository'
import { TrackElasticRepository } from '@libs/repositories/elasticsearch/track.elastic.repository'
import { LineRepository } from '@libs/repositories/line.repository'
import { Provider } from '@nestjs/common'
import { AxiosInstance } from 'axios'
import { DataSource } from 'typeorm'

export const ormRepositoryProviders: Provider[] = [
    {
        provide: ProviderName.USER_REPOSITORY,
        inject: [ProviderName.ORM_DATASOURCE],
        useFactory: (ds: DataSource) => ds.getRepository(User),
    },
    {
        provide: ProviderName.ADMIN_REPOSITORY,
        inject: [ProviderName.ORM_DATASOURCE],
        useFactory: (ds: DataSource) => ds.getRepository(Admin),
    },
    {
        provide: ProviderName.COMMUNITY_REPOSITORY,
        inject: [ProviderName.ORM_DATASOURCE],
        useFactory: (ds: DataSource) => ds.getRepository(Community),
    },
    {
        provide: ProviderName.CONTENT_REPOSITORY,
        inject: [ProviderName.ORM_DATASOURCE],
        useFactory: (ds: DataSource) => ds.getRepository(Content),
    },
]

export const lineRepositoryProvider: Provider = {
    provide: ProviderName.LINE_REPOSITORY,
    inject: [ProviderName.HTTP_CLIENT, ProviderName.ENV_CONFIG],
    useFactory: (client: AxiosInstance, config: EnvironmentConfig) => {
        return new LineRepository(client, config)
    },
}

export const searchRepositoryProviders: Provider[] = [
    {
        provide: ProviderName.SEARCH_REPOSITORY,
        inject: [ProviderName.ELASTIC_CLIENT],
        useFactory: async (client: Client) => {
            return new ElasticsearchRepository(client)
        },
    },
    {
        provide: ProviderName.TRACK_REPOSITORY,
        inject: [ProviderName.ELASTIC_CLIENT],
        useFactory: async (client: Client) => {
            return new TrackElasticRepository(client)
        },
    },
]

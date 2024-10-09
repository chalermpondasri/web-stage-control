import { ProviderName } from '@libs/common/constants/providerName'
import { Provider } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { AxiosInstance } from 'axios'
import { EnvironmentConfig } from '@libs/common/models'
import { LineRepository } from '@libs/repositories/line.repository'
import { Admin } from '@libs/entities/admin.entity'
import { Community } from '@libs/entities/community.entity'
import { Content } from '@libs/entities/content.entity'
import { User } from '@libs/entities/user.entity'

export const ormRepositoryProviders: Provider[] = [
    {
        provide: ProviderName.USER_REPOSITORY,
        inject: [ProviderName.ORM_DATASOURCE],
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
        provide: ProviderName.CONTENT_REPOSITORY,
        inject: [
            ProviderName.ORM_DATASOURCE,
        ],
        useFactory: (ds: DataSource) => ds.getRepository(Content),
    },
]

export const lineRepositoryProvider: Provider = {
    provide: ProviderName.LINE_REPOSITORY,
    inject: [
        ProviderName.HTTP_CLIENT,
        ProviderName.ENV_CONFIG,
    ],
    useFactory: (
        client: AxiosInstance,
        config: EnvironmentConfig,
    ) => {
        return new LineRepository(client, config)
    },
}
import { ProviderName } from '@libs/common/constants/providerName'
import { Provider } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { Profile } from '@libs/entities/profile.entity'
import { User } from '@libs/entities/user'
import { AxiosInstance } from 'axios'
import { EnvironmentConfig } from '@libs/common/models'
import { LineRepository } from '@libs/repositories/line.repository'
import { Admin } from '@libs/entities/admin.entity'

export const ormRepositoryProviders: Provider[] = [
    {
        provide: ProviderName.USER_REPOSITORY,
        inject: [ProviderName.ORM_DATASOURCE],
        useFactory: (ds: DataSource) => ds.getRepository(User)
    },
    {
        provide: ProviderName.ADMIN_REPOSITORY,
        inject: [
            ProviderName.ORM_DATASOURCE,
        ],
        useFactory: (ds: DataSource) => ds.getRepository(Admin)
    }
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
    }
}
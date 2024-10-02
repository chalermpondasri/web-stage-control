import { ProviderName } from '@libs/common/constants/providerName'
import { Provider } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { Profile } from '@libs/entities/profile.entity'
import { User } from '@libs/entities/user'

export const ormRepositoryProviders: Provider[] = [
    {
        provide: ProviderName.PROFILE_REPOSITORY,
        inject: [ProviderName.ORM_DATASOURCE],
        useFactory: (ds: DataSource) => ds.getRepository(Profile),
    },
    {
        provide: ProviderName.USER_REPOSITORY,
        inject: [ProviderName.ORM_DATASOURCE],
        useFactory: (ds: DataSource) => ds.getRepository(User)
    }

]
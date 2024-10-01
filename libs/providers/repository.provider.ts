import { ProviderName } from '@libs/common/constants/providerName'
import { Provider } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ProfileEntity } from '@libs/entities/profile.entity'

export const ormRepositoryProviders: Provider[] = [
    {
        provide: ProviderName.PROFILE_REPOSITORY,
        inject: [ProviderName.ORM_DATASOURCE],
        useFactory: (ds: DataSource) => ds.getRepository(ProfileEntity),
    },

]
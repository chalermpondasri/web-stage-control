import { Module } from '@nestjs/common'
import {
    ormDatasourceProvider,
    ormEntityProvider,
} from '@libs/providers/datasource.provider'
import { ormRepositoryProviders } from '@libs/providers/repository.provider'

@Module({
    providers: [ormEntityProvider, ormDatasourceProvider, ...ormRepositoryProviders],
    exports: [...ormRepositoryProviders],
})
export class OrmModule {}
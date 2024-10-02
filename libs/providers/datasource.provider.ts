import { ProviderName } from '@libs/common/constants/providerName'
import { EnvironmentConfig } from '@libs/common/models'
import { Provider } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { User } from '@libs/entities/user'

export const ormEntityProvider: Provider = {
    provide: ProviderName.ORM_ENTITY,
    useValue: [
        User,
        // Profile,
    ],

}
export const ormDatasourceProvider: Provider = {
    provide: ProviderName.ORM_DATASOURCE,
    inject: [ProviderName.ENV_CONFIG, ProviderName.ORM_ENTITY],
    useFactory: async (config: EnvironmentConfig, entities) => {
        console.log(config.NODE_ENV === 'development')
        return await new DataSource({
            type: 'postgres',
            host: config.RDB_HOST,
            port: Number(config.RDB_PORT),
            username: config.RDB_USERNAME,
            password: config.RDB_PASSWORD,
            entities,
            migrationsTableName: 'migration_billboard',
            applicationName: 'billboard',
            database: config.RDB_DBNAME,
            logging: config.NODE_ENV === 'development' ? 'all' : false,
            synchronize: config.NODE_ENV === 'development',
        }).initialize()
    },
}

import { ProviderName } from '@libs/common/constants/providerName'
import { EnvironmentConfig } from '@libs/common/models'
import { Admin } from '@libs/entities/admin.entity'
import { Broadcast } from '@libs/entities/broadcast.entity'
import { Community } from '@libs/entities/community.entity'
import {
    PlayedMedia,
    Playlist,
} from '@libs/entities/playlist.entity'
import { User } from '@libs/entities/user.entity'
import { Voucher } from '@libs/entities/voucher.entity'
import { Provider } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { Payment } from '@libs/entities/payment.entity'
import { Stage } from '@libs/entities/stage.entity'
import { Transaction } from '@libs/entities/transaction.entity'
import { CoinDeduction } from '@libs/entities/coin-deduction.entity'
import { PaymentTransaction } from '@libs/entities/payment-transaction.entity'

export const ormEntityProvider: Provider = {
    provide: ProviderName.ORM_ENTITY,
    useValue: [
        Admin,
        User,
        Community,
        Playlist,
        Broadcast,
        Payment,
        Voucher,
        Stage,
        PlayedMedia,
        Transaction,
        CoinDeduction,
        PaymentTransaction,
    ],
}
export const ormDatasourceProvider: Provider = {
    provide: ProviderName.ORM_DATASOURCE,
    inject: [
        ProviderName.ENV_CONFIG,
        ProviderName.ORM_ENTITY,
    ],
    useFactory: async (config: EnvironmentConfig, entities) => {
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
            logging: config.NODE_ENV !== 'production' && !!config.RDB_LOG ? 'all' : false,
            synchronize: config.NODE_ENV !== 'production',
        }).initialize()
    },
}

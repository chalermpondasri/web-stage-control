
import path from 'path'
import { DataSource } from 'typeorm'

export default new DataSource({
    type: 'postgres',
    host: process.env.RDB_HOST,
    port: Number(process.env.RDB_PORT),
    username: process.env.RDB_USERNAME,
    password: process.env.RDB_PASSWORD,
    migrations: [path.resolve('.', 'apps', 'migration', 'src', 'typeorm', '*{.ts,.js}')],
    migrationsTableName: 'migration_payments',
    applicationName: 'doofin',
    database: process.env.RDB_DBNAME,
    logger: 'debug',
    logging: 'all',
})

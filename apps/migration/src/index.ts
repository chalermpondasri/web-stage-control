import { Logger, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { config } from 'dotenv'
import path from 'path'
import * as process from 'process'
import { DataSource } from 'typeorm/data-source/DataSource'

@Module({})
class MigrationModule implements OnModuleInit, OnModuleDestroy {
    private _dataSource: DataSource

    public constructor() {
        config()
    }

    public async onModuleInit() {
        const { env } = process

        this._dataSource = await new DataSource({
            type: 'postgres',
            host: env.RDB_HOST,
            port: Number(env.RDB_PORT),
            username: env.RDB_USERNAME,
            password: env.RDB_PASSWORD,
            migrations: [path.resolve(__dirname, 'typeorm', '*{.ts,.js}')],
            migrationsTableName: 'migration_billboard',
            database: env.RDB_DBNAME,
            logging: 'all',
        }).initialize()

        const migrations = await this._dataSource.runMigrations({ transaction: 'all' })
        Logger.log(migrations, MigrationModule.name)
    }

    public async onModuleDestroy() {
        await this._dataSource.destroy()
    }
}

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(MigrationModule)
    await app.close()
}

bootstrap()

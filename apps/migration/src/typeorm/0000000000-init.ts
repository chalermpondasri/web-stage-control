import { config } from 'dotenv'
import * as process from 'process'
import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class init0000000000 implements MigrationInterface {
    public async up(q: QueryRunner): Promise<void> {
        config()

        await q.createDatabase(process.env.RDB_DBNAME, true)
        await q.createTable(
            new Table({
                name: 'payment',
                columns: [
                    {
                        name: 'transactionId',
                        type: 'varchar',
                        isPrimary: true,
                    },
                    {
                        name: 'userId',
                        type: 'varchar',
                    },
                    {
                        name: 'profileId',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'total',
                        type: 'decimal',
                        isNullable: true,
                    },
                    {
                        name: 'coinPackageId',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'coinPackagePrice',
                        type: 'decimal',
                        isNullable: true,
                    },
                    {
                        name: 'coinGain',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'coinBonus',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'paymentStatus',
                        type: 'varchar',
                    },
                    {
                        name: 'createdAt',
                        type: 'timestamptz',
                        default: 'NOW()',
                    },
                    {
                        name: 'updatedAt',
                        type: 'timestamptz',
                        default: 'NOW()',
                    },
                ],
            }),
            true,
        )
    }

    public async down(q: QueryRunner): Promise<void> {
        config()
        await q.dropTable('payment', true)
    }
}

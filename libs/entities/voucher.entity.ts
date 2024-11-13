import { ApiProperty } from '@nestjs/swagger'
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { Payment } from './payment.entity'

@Entity()
export class Voucher {
    @ApiProperty()
    @PrimaryColumn({ type: 'varchar', length: 10 })
    public code: string

    @ApiProperty()
    @Column({ type: 'int' })
    public campaignId: number

    @ApiProperty()
    @Column({ type: 'varchar' })
    public campaignName: string

    @ApiProperty()
    @Column({ type: 'boolean', default: false })
    public reusable: boolean

    @ApiProperty({})
    @Column({
        default: 0,
        type: 'int',
    })
    public amountUsed: number

    @ApiProperty({})
    @Column({
        default: 0,
        type: 'int',
    })
    public coinGains: number

    @ApiProperty({
        type: () => [
            Payment,
        ],
    })
    @OneToMany(() => Payment, (payment) => payment.voucher)
    public payments: Payment[]

    @ApiProperty({
        type: Date,
        nullable: true,
        required: false,
    })
    @Column({ nullable: true, type: 'timestamptz' })
    public startDate: Date

    @ApiProperty({
        type: Date,
        nullable: true,
        required: false,
    })
    @Column({ nullable: true, type: 'timestamptz' })
    public endDate: Date

    @ApiProperty({ type: Date })
    @CreateDateColumn()
    public createdAt: Date

    @ApiProperty({ type: Date })
    @UpdateDateColumn()
    public updatedAt: Date
}

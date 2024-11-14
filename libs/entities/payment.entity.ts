import { PaymentStatus } from '@libs/common/constants/payment-status.enum'
import { DecimalValueTransformer } from '@libs/utilities/transformers/decimal-transformer.util'
import Decimal from 'decimal.js'
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { Voucher } from './voucher.entity'

export enum PaymentType {
    COIN_PACKAGE = 'COIN_PACKAGE',
    VOUCHER = 'VOUCHER',
}

@Entity()
export class Payment {
    @PrimaryColumn({ type: 'varchar' })
    public transactionId: string

    @Column({ type: 'varchar' })
    public userId: string

    /**
     * Total paid after deduction
     */
    @Column({ type: 'decimal', transformer: new DecimalValueTransformer(), nullable: true })
    public total: Decimal

    @Column({ nullable: true })
    public coinPackageId: number

    /**
     * original Package Price
     */
    @Column({ type: 'decimal', transformer: new DecimalValueTransformer(), nullable: true })
    public coinPackagePrice: Decimal

    @Column({ nullable: true })
    public coinGain: number

    @Column({ nullable: true })
    public coinBonus: number

    @Column({ type: 'varchar' })
    public paymentStatus: PaymentStatus

    @Column({ nullable: true, type: 'timestamptz' })
    public expiredAt: Date

    @Column({ nullable: true, type: 'text' })
    public referenceNumber: string

    @Column({ type: 'varchar', default: PaymentType.COIN_PACKAGE })
    public type: PaymentType

    @ManyToOne(() => Voucher, (voucher) => voucher.payments)
    public voucher: Voucher

    @Column({ type: 'int', nullable: true })
    public campaignId: number

    @CreateDateColumn()
    public createdAt: Date

    @UpdateDateColumn()
    public updatedAt: Date
}

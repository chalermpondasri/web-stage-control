import { DecimalValueTransformer } from '@libs/utilities/transformers/decimal-transformer.util'
import Decimal from 'decimal.js'
import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { PaymentStatus } from '@libs/common/constants/payment-status.enum'

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

    @Column({ nullable: true , type:'timestamptz' })
    public expiredAt: Date

    @Column({ nullable: true , type: 'text'})
    public referenceNumber: string

    @CreateDateColumn()
    public createdAt: Date
    @UpdateDateColumn()
    public updatedAt: Date
}

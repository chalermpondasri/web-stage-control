import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryColumn,
    UpdateDateColumn,
} from 'typeorm'
import { Broadcast } from './broadcast.entity'
import { User } from './user.entity'
import { Voucher } from './voucher.entity'

export enum TransactionType {
    BROADCAST = 'BROADCAST',
}

@Entity()
export class Transaction {
    @PrimaryColumn({ type: 'varchar' })
    public transactionId: string

    @Column({ nullable: true })
    public coinAmount: number

    @Column({ type: 'varchar', default: TransactionType.BROADCAST })
    public type: TransactionType

    @JoinColumn()
    @ManyToOne(() => Voucher, (voucher) => voucher.payments)
    public voucher: Voucher

    @Column({ type: 'int', nullable: true })
    public campaignId: number

    @JoinColumn()
    @OneToOne(() => Broadcast, (broadcast) => broadcast.transaction)
    public broadcast: Broadcast

    @JoinColumn()
    @ManyToOne(() => User)
    public createdBy: User

    @CreateDateColumn()
    public createdAt: Date

    @UpdateDateColumn()
    public updatedAt: Date
}

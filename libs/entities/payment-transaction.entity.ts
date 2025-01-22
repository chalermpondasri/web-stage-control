import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm'

@Entity()
export class PaymentTransaction {
    @PrimaryGeneratedColumn('uuid')
    public id: string

    @Column({type: 'varchar'})
    public payeeProxyId: string
    @Column({type: 'varchar'})
    public payeeProxyType: string

    @Column({type: 'varchar'})
    public payeeAccountNumber: string

    @Column({type: 'varchar'})
    public payeeName: string

    @Column({type: 'varchar'})
    public payerProxyId: string

    @Column({type: 'varchar'})
    public payerProxyType: string

    @Column({type: 'varchar'})
    public payerAccountNumber: string

    @Column({type: 'varchar'})
    public payerName: string

    @Column({type: 'varchar'})
    public sendingBankCode: string

    @Column({type: 'varchar'})
    public receivingBankCode: string

    @Column({type: 'varchar'})
    public amount: string

    @Column({type: 'varchar'})
    public channelCode: string

    @Column({type: 'varchar'})
    public transactionId: string

    @Column({ type: 'timestamptz' })
    public transactionDateandTime: string // ISO 8601 formatted datetime

    @Column({type: 'varchar'})
    public billPaymentRef1: string

    @Column({type: 'varchar'})
    public billPaymentRef2: string

    @Column({type: 'varchar'})
    public billPaymentRef3: string

    @Column({type: 'varchar'})
    public currencyCode: string

    @Column({type: 'varchar'})
    public transactionType: string

    @CreateDateColumn()
    public createdAt: Date
}
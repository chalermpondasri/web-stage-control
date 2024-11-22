import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import { User } from '@libs/entities/user.entity'

export enum DeductionEvent {
    BOOST = 'BOOST',
    BROADCAST = 'BROADCAST',
}

@Entity()
export class CoinDeduction {
    @PrimaryGeneratedColumn('uuid')
    public id: string

    @Column()
    public userId: string

    @ManyToOne(() => User)
    public user: User

    @Column({type: 'varchar', nullable: true})
    public communityId: string

    @Column({nullable: true})
    public trackId: number

    @Column()
    public deductedCoin: number

    @Column()
    public deductionEvent: DeductionEvent

    @Column({type:'timestamptz'})
    public deductedAt: Date

    @CreateDateColumn()
    public createdAt: Date

    @UpdateDateColumn()
    public updatedAt: Date

}
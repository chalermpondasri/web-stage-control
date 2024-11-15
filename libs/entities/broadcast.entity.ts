import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import { Community } from './community.entity'
import { Transaction } from './transaction.entity'
import { User } from './user.entity'

@Entity({
    comment: 'broadcast entity',
})
export class Broadcast {
    @PrimaryGeneratedColumn('uuid')
    public id: string

    @Column()
    public message: string

    @Column({ nullable: true })
    public stickerId: number

    @JoinColumn()
    @ManyToOne(() => Community, (community) => community.broadcasts)
    public community: Community

    @JoinColumn()
    @ManyToOne(() => User, (user) => user.id)
    public createdBy: User

    @Column({ default: false })
    public isContainsBadWords: boolean

    @Column({ default: false })
    public isShowProfileImage: boolean

    @Column({ default: false })
    public isShowProfileName: boolean

    @JoinColumn()
    @OneToOne(() => Transaction, (transaction) => transaction.broadcast)
    public transaction: Transaction

    @Column({ default: 0 })
    public cost: number

    @CreateDateColumn()
    public createdAt: Date

    @UpdateDateColumn()
    public updatedAt: Date
}

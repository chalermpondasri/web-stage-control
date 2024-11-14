import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import { Community } from './community.entity'
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

    // TODO:: add transaction

    @CreateDateColumn()
    public createdAt: Date

    @UpdateDateColumn()
    public updatedAt: Date
}

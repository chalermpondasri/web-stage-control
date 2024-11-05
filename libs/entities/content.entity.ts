import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import { Community } from '@libs/entities/community.entity'
import { QueueState } from '@libs/common/models/media/queue-state.enum'

@Entity()
export class Content {
    @PrimaryGeneratedColumn('uuid')
    public id: string

    @JoinColumn()
    @ManyToOne(() => Community, community => community.playlist)
    public communityId: string

    @Column({type:'text'})
    public coverImage: string

    @Column()
    public title: string

    @Column()
    public artist: string

    @Column({
        type: 'numeric'
    })
    @Column()
    public totalBoost: number

    @Column({type: 'int'})
    public duration: number

    @Column()
    public queueState: QueueState

    @CreateDateColumn()
    public createdAt: Date

    @UpdateDateColumn()
    public updatedAt: Date

}
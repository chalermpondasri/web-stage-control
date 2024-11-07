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
export class Playlist {
    @PrimaryGeneratedColumn('uuid')
    public id: string



    @Column()
    public communityId: string

    @JoinColumn()
    @ManyToOne(() => Community, community => community.playlist)
    public community: string


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
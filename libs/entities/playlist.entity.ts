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
import { Locale } from '@libs/common/models'

@Entity()
export class Playlist {
    @PrimaryGeneratedColumn('uuid')
    public id: string


    @Column()
    public communityId: string

    @JoinColumn()
    @ManyToOne(() => Community, community => community.playlist)
    public community: Community


    @Column({type:'text'})
    public coverImage: string


    @Column({nullable: true})
    public trackId: number

    @Column()
    public title: string

    @Column()
    public artist: string

    @Column({nullable: true})
    public albumId: string

    @Column({nullable: true, type: 'json'})
    public albumName: Locale

    @Column({nullable: true, type: 'text'})
    public albumImageUrl: string

    @Column({
        type: 'numeric'
    })
    @Column()
    public totalBoost: number

    @Column({type: 'int'})
    public duration: number

    @Column({type: 'varchar'})
    public queueState: QueueState

    @CreateDateColumn()
    public createdAt: Date

    @UpdateDateColumn()
    public updatedAt: Date

}
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

@Entity()
export class Content {
    @PrimaryGeneratedColumn('uuid')
    public id: string

    @JoinColumn()
    @ManyToOne(() => Community, community => community.playlist)
    public communityId: string

    @Column()
    public title: string

    @Column()
    public artist: string

    @Column({
        type: 'numeric'
    })
    public influencePoint: number

    @Column({type: 'int'})
    public duration: number

    @Column({type: 'boolean'})
    public isPlaying: boolean

    @CreateDateColumn()
    public createdAt: Date

    @UpdateDateColumn()
    public updatedAt: Date

}
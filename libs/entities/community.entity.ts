import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import { Admin } from '@libs/entities/admin.entity'
import { Playlist } from '@libs/entities/playlist.entity'
import { Broadcast } from './broadcast.entity'
import { Stage } from '@libs/entities/stage.entity'

@Entity({
    comment: 'community entity',
})
export class Community {
    @PrimaryGeneratedColumn('uuid')
    public id: string

    @Column()
    public name: string

    @Column({type:'timestamptz'})
    public startDate: Date

    @Column({type:'timestamptz'})
    public endDate: Date

    @Column({nullable: true})
    public location: string

    @Column({nullable: true})
    public coverImage: string

    @OneToMany(() => Playlist, target => target)
    public playlist: Promise<Playlist[]>

    @ManyToMany(() => Admin, admin => admin.communities)
    public admins: Admin[]
    
    @OneToMany(() => Broadcast, target => target)
    public broadcasts: Promise<Broadcast[]>

    @OneToMany(() => Stage, stage => stage.community)
    public stages: Promise<Stage[]>

    @CreateDateColumn()
    public createdAt: Date

    @UpdateDateColumn()
    public updatedAt: Date

    @DeleteDateColumn()
    public deletedAt: Date
}
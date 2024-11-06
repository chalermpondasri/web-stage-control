import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import { Admin } from '@libs/entities/admin.entity'
import { Playlist } from '@libs/entities/playlist.entity'

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

    @CreateDateColumn()
    public createdAt: Date

    @UpdateDateColumn()
    public updatedAt: Date

    @DeleteDateColumn()
    public deletedAt: Date
}
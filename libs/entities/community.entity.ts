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
import { Content } from '@libs/entities/content.entity'
import { Admin } from '@libs/entities/admin.entity'

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

    @JoinColumn()
    @OneToMany(() => Content, target => target.communityId)
    public playlist: Content[]

    @ManyToMany(() => Admin, admin => admin.communities)
    public admins: Admin[]

    @CreateDateColumn()
    public createdAt: Date

    @UpdateDateColumn()
    public updatedAt: Date

    @DeleteDateColumn()
    public deletedAt: Date
}
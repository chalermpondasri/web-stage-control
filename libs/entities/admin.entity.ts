import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import { Community } from '@libs/entities/community.entity'

@Entity({
    comment: 'community admin entity',
})
export class Admin {
    @PrimaryGeneratedColumn('uuid')
    public id: string

    @Column('varchar', { unique: true })
    public username: string

    @Column('varchar')
    public secret: string

    @Column('varchar', { nullable: true })
    public company?: string

    @ManyToMany(() => Community, community => community.admins)
    public communities: Community[]

    @CreateDateColumn()
    public createdAt: Date

    @UpdateDateColumn()
    public updatedAt: Date

    @DeleteDateColumn()
    public deletedAt: Date

}
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'

@Entity({
    comment: 'community admin entity',
})
export class User {
    @PrimaryGeneratedColumn('uuid')
    public id: string

    @Column('varchar', { unique: true })
    public username: string

    @Column('varchar')
    public secret: string

    @Column('varchar', { nullable: true })
    public company?: string

    @CreateDateColumn()
    public createdAt: Date

    @UpdateDateColumn()
    public updatedAt: Date

    @DeleteDateColumn()
    public deletedAt: Date

}
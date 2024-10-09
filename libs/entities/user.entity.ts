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

    @Column()
    public name: string

    @Column({nullable: true, type: 'text'})
    public picture: string

    @Column({nullable: true})
    public lineId: string

    @CreateDateColumn()
    public createdAt: Date

    @UpdateDateColumn()
    public updatedAt: Date

    @DeleteDateColumn()
    public deletedAt: Date

}
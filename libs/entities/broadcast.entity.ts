import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity({
    comment: 'broadcast entity',
})
export class Broadcast {
    @PrimaryGeneratedColumn('uuid')
    public id: string

    @Column()
    public message: string

    // TODO:: sticker id and user id could be in transaction ?
    @Column()
    public stickerId: number

    // @ManyToOne(() => User, (user) => user.id)
    // public user: User

    // TODO:: add transaction

    @CreateDateColumn()
    public createdAt: Date

    @UpdateDateColumn()
    public updatedAt: Date
}

import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'

@Entity({
    comment: 'general user entity',
})
export class User {
    @PrimaryGeneratedColumn('uuid')
    public id: string

    @Column()
    public name: string

    @Column({ nullable: true, type: 'text' })
    public picture: string

    @Column({ nullable: true })
    public lineId: string

    @Column({ default: false, type: 'boolean'})
    public isConsentAccepted: boolean

    @Column({ nullable: true, type: 'text', comment: 'base64 encoded content' })
    public acceptedConsent: string

    @Column({type: 'text', nullable: true})
    public phoneNumber: string

    @Column({type: 'text', nullable: true})
    public email: string

    @Column({type: 'json', nullable: true})
    public setting: {showProfile: boolean, showName: boolean} = {showName: true, showProfile: true}

    @CreateDateColumn()
    public createdAt: Date

    @UpdateDateColumn()
    public updatedAt: Date

    @DeleteDateColumn()
    public deletedAt: Date

}
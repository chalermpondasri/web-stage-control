import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import { generate } from 'generate-password'
import { Community } from '@libs/entities/community.entity'

@Entity()
export class Stage {
    @PrimaryGeneratedColumn('uuid')
    public id: string

    @Column({ nullable: true })
    public location: string

    @Column({ unique: true })
    public authorizationCode: string = generate({
        length: 16,
        numbers: true,
        lowercase: true,
        uppercase: true,
        strict: true,
    })
    @CreateDateColumn()
    public createdAt: Date
    @UpdateDateColumn()
    public updatedAt: Date
    @Column({ type: 'timestamptz', nullable: true })
    public lastActivity: Date
    @DeleteDateColumn()
    public deletedAt: Date

    @Column()
    public communityId: string
    @JoinColumn()
    @OneToOne(() => Community, community => community.stages, {eager: true})
    public community: Community

}
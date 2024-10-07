import { Expose } from 'class-transformer'

export class AdminUserDto {

    @Expose()
    public id: string
    @Expose()
    public username: string
}


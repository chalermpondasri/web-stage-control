import { Expose } from 'class-transformer'

export class UserDto {

    @Expose()
    public id: string
    @Expose()
    public username: string
}


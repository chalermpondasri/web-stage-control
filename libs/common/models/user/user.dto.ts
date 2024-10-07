import { Expose } from 'class-transformer'

export class UserDto {
    @Expose()
    public id: string
    @Expose()
    public name: string
    @Expose()
    public picture: string
}
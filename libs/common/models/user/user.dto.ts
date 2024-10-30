import { Expose } from 'class-transformer'

export class UserDto {
    @Expose()
    public id: string
    @Expose()
    public name: string
    @Expose()
    public picture: string

    @Expose()
    public email: string

    @Expose()
    public isConsentAccepted: boolean

    @Expose()
    public setting: {showProfile: boolean, showName: boolean}
}
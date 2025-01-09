import { Type } from 'class-transformer'

export class FullName {
    public firstName: string
    public lastName: string
}
export class AppleUserRequest {
    @Type(() => FullName)
    public name: FullName
    public email: string
}
export class AppleLoginRequest {
    public code: string
    public id_token: string
    @Type(() => AppleUserRequest)
    public user: AppleUserRequest

}




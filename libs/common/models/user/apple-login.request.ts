import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class FullName {
    @ApiProperty()
    public firstName: string
    @ApiProperty()
    public lastName: string
}
export class AppleUserRequest {
    @ApiProperty({type: FullName})
    @Type(() => FullName)

    public name: FullName
    @ApiProperty()
    public email: string
}
export class AppleLoginRequest {
    @ApiProperty()
    public code: string
    @ApiProperty()
    public id_token: string
    @ApiProperty({type: AppleUserRequest})
    @Type(() => AppleUserRequest)
    public user: AppleUserRequest

}




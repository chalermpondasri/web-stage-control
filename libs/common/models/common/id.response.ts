import { Expose } from 'class-transformer'

export class IdResponse {
    @Expose() public id: string
}

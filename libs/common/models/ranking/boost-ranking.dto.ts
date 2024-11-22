import { ApiProperty } from '@nestjs/swagger'

export class UserRankingDto {
    @ApiProperty({type: 'uuid', example: '532f288f-d4a5-4d1d-8c33-941ab7c3593b'})
    public id: number
    @ApiProperty({example:'lo*******m'})
    public name: string
    @ApiProperty({nullable: true})
    public avatar: string
    @ApiProperty()
    public coinSpent: number
}
export class BoostRankingDto {
    @ApiProperty()
    public startDate: Date
    @ApiProperty()
    public endDate: Date
    @ApiProperty({type:UserRankingDto })
    public ranking: UserRankingDto[]

}
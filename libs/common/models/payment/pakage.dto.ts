import { Expose } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class PackageDto {
    @Expose()
    @ApiProperty()
    public id: number

    @Expose()
    @ApiProperty()
    public totalCoinGain: number

    @Expose()
    @ApiProperty()
    public bonus: number

    @Expose()
    @ApiProperty()
    public price: number

}
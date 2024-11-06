import { Expose } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class Locale {
    @ApiProperty()
    public en: string
    @ApiProperty()
    public th: string
    @ApiProperty()
    public cn: string
}

import { Module } from '@nestjs/common'
import { OrmModule } from '@libs/modules/orm.module'
import { GlobalModule } from '@libs/modules/global.module'

@Module({
    imports: [
        GlobalModule,
        OrmModule,
    ]
})
export class MainModule {

}
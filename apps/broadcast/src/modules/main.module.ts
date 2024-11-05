import { GlobalModule } from '@libs/modules/global.module'
import { Module } from '@nestjs/common'
import { BroadcastModule } from './broadcast.module'

@Module({
    imports: [
        GlobalModule,
        BroadcastModule,
    ],
})
export class MainModule {}

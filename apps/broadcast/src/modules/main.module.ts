import { Module } from '@nestjs/common'
import { BroadcastModule } from './broadcast.module'

@Module({
    imports: [
        BroadcastModule,
    ],
})
export class MainModule {}

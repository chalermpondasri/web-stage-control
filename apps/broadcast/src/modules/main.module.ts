import { Module } from '@nestjs/common'
import { BroadcastModule } from './broadcast.module'
import { AnnouncementModule } from './announcement.module'

@Module({
    imports: [
        BroadcastModule,
        AnnouncementModule,
    ],
})
export class MainModule {}

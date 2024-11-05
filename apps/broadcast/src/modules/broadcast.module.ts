import { OrmModule } from '@libs/modules/orm.module'
import { BroadcastSseService } from '@libs/sse/broadcast.sse'
import { Module } from '@nestjs/common'
import { BroadcastController } from '../controllers/broadcast.controller'
import { BroadcastService } from '../domains/broadcast/broadcast.service'

@Module({
    imports: [
        OrmModule,
    ],
    controllers: [
        BroadcastController,
    ],
    providers: [
        BroadcastService,
        BroadcastSseService,
    ],
})
export class BroadcastModule {}

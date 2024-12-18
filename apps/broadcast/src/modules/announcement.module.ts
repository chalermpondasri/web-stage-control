import { Module } from '@nestjs/common'
import { GlobalModule } from '@libs/modules/global.module'
import { OrmModule } from '@libs/modules/orm.module'
import { AnnouncementController } from '../controllers/announcement.controller'
import { announcementServiceProvider } from '../providers/service.provider'

@Module({
    imports: [
        GlobalModule,
        OrmModule,
    ],
    providers: [
        announcementServiceProvider,
    ],
    controllers: [
        AnnouncementController,
    ]
})
export class AnnouncementModule {}
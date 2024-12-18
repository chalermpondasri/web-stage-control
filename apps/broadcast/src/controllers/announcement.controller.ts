import { AnnouncementService } from '../domains/announcement/announcement.service'
import { ProviderName } from '@libs/common/constants'
import {
    Controller,
    Get,
    Inject,
    Query,
} from '@nestjs/common'
import {
    ApiOperation,
    ApiQuery,
    ApiResponse,
} from '@nestjs/swagger'
import { AnnouncementDto } from '@libs/common/models/announcement/announcement.dto'

@Controller('/announcements')
export class AnnouncementController {
    public constructor(
        @Inject(ProviderName.ANNOUNCEMENT_SERVICE)
        private readonly _announcementService: AnnouncementService,
    ) {
    }


    @ApiOperation({
        description: 'Get announcement configuration',
    })
    @ApiQuery({name: 'communityId', type: 'uuid', description: 'community uuid'})
    @ApiResponse({type: [AnnouncementDto]})
    @Get('/')
    public getAnnouncements(
        @Query('communityId') communityId: string,
    ) {
        return this._announcementService.getCommunityAnnouncements(communityId)
    }
}
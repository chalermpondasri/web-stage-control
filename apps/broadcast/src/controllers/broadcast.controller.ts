import { ProviderName } from '@libs/common/constants'
import { GenericUserGuard } from '@libs/guards/generic-user.guard'
import { Body, Controller, Get, Inject, MessageEvent, Param, Post, Query, Sse, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Observable } from 'rxjs'
import { BroadcastService } from '../domains/broadcast/broadcast.service'
import { CreateBroadcastMessageRequest, GetStickerRequest } from '../domains/broadcast/dtos/broadcast.dto'

@ApiTags(
    ...[
        'broadcast',
    ],
)
@Controller('/broadcast')
export class BroadcastController {
    constructor(
        @Inject(ProviderName.BROADCAST_SERVICE)
        private readonly _broadcastService: BroadcastService,
    ) {}

    @ApiOperation({
        description: 'Get all stickers',
    })
    @UseGuards(GenericUserGuard)
    @ApiBearerAuth()
    @Get('/stickers')
    public getStickers(@Query() getStickerRequest: GetStickerRequest) {
        return this._broadcastService.getAllStickers(getStickerRequest)
    }

    @ApiOperation({
        description: 'Create a broadcast message',
        requestBody: {
            $ref: 'CreateBroadcastMessageRequest',
        },
    })
    @UseGuards(GenericUserGuard)
    @ApiBearerAuth()
    @Post('/:communityId/message')
    public createBroadcastMessage(
        @Param('communityId') communityId: string,
        @Body() broadcastBody: CreateBroadcastMessageRequest,
    ) {
        return this._broadcastService.createBroadcastMessage(communityId, broadcastBody)
    }

    @ApiOperation({
        description: 'Subscribe for a broadcast message',
    })
    @Sse('/sse/:communityId')
    public broadcastSSE(@Param('communityId') communityId: string): Observable<MessageEvent> {
        return this._broadcastService.sse(communityId)
    }
}

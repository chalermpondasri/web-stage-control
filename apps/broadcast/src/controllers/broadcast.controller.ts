import { GenericUserGuard } from '@libs/guards/generic-user.guard'
import { Body, Controller, Get, MessageEvent, Post, Query, Sse, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Observable } from 'rxjs'
import { BroadcastService } from '../domains/broadcast/broadcast.service'
import { CreateBroadcastMessageRequest, GetStickerRequest } from '../domains/broadcast/dtos/broadcast.dto'

@ApiTags(
    ...[
        'broadcast',
    ],
)
@ApiBearerAuth()
@Controller('/broadcast')
@UseGuards(GenericUserGuard)
export class BroadcastController {
    constructor(private readonly _broadcastService: BroadcastService) {}

    @ApiOperation({
        description: 'Get all stickers',
    })
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
    @ApiExtraModels(CreateBroadcastMessageRequest)
    @Post('/message')
    public createBroadcastMessage(@Body() broadcastBody: CreateBroadcastMessageRequest) {
        return this._broadcastService.createBroadcastMessage(broadcastBody)
    }

    @ApiOperation({
        description: 'Subscribe for a broadcast message',
    })
    @Sse('sse')
    public broadcastSSE(): Observable<MessageEvent> {
        return this._broadcastService.sse()
    }
}

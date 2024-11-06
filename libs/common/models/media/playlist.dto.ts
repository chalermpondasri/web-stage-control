import { QueueTrackDto } from '@libs/common/models/media/queue-track.dto'
import {
    Expose,
} from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class PlaylistDto {
    @ApiProperty()
    @Expose()
    public communityId: string

    @ApiProperty({
        type: [QueueTrackDto]
    })
    @Expose()
    public queue: QueueTrackDto[]
}
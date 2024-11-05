import { QueueTrackDto } from '@libs/common/models/media/queue-track.dto'
import { Expose } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class PlaylistDto {
    @Expose()
    @ApiProperty()
    public id: string

    @ApiProperty()
    @Expose()
    public communityId: string

    @ApiProperty()
    @Expose()
    public queue: QueueTrackDto[]
}
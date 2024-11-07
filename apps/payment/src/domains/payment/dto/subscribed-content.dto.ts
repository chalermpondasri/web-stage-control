import { DateTimeString } from '@libs/common/models'

export class SubscribedContentDto {
    public mediaContentId: number
    public episodeId: number
    public rentAt: DateTimeString
}

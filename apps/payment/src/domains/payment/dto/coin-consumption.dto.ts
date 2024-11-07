import { DateTimeString } from '@libs/common/models'

export class CoinConsumptionDto {
    public id: string
    public coinSpent: number
    public mediaContentId: number
    public episodeId: number
    public rentAt: DateTimeString
}

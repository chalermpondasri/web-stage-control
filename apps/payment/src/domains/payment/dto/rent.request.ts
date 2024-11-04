import { IsNumber } from 'class-validator'

export class RentRequest {
    @IsNumber()
    public mediaId: number
    @IsNumber()
    public episodeId: number
}

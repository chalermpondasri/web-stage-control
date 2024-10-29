import { MediaES } from './media.interface'

export interface AlbumES {
    id: number
    name_th: string
    name_en: string
    releaseDate?: Date
    image?: MediaES
    type: string
    artist_ids?: number[]
    track_ids?: number[]
    createdAt: Date
    updatedAt: Date
    publishedAt?: Date | null
}

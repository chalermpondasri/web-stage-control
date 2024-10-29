import { MediaES } from './media.interface'

export interface ArtistES {
    id: number
    name_th: string
    name_en: string
    description?: string
    type: string
    aliases?: string[]
    album_ids: number[]
    track_ids: number[]
    image?: MediaES
    coverImage?: MediaES
    playlist_ids: number[]
    locale?: string
    createdAt: Date
    updatedAt: Date
    publishedAt?: Date | null
}

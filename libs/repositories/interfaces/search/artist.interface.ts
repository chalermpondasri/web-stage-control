import { AlbumES } from './album.interface'
import { MediaES } from './media.interface'
import { TrackES } from './track.interface'

export interface ArtistES {
    id: number
    name_th: string
    name_en: string
    description?: string
    type: string
    aliases?: string[]
    albums?: AlbumES[]
    album_ids: number[]
    tracks?: TrackES[]
    track_ids: number[]
    image?: MediaES
    coverImage?: MediaES
    playlist_ids: number[]
    locale?: string
    createdAt: Date
    updatedAt: Date
    publishedAt?: Date | null
}

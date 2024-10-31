import { AlbumES } from './album.interface'
import { ArtistES } from './artist.interface'
import { MediaES } from './media.interface'

export interface TrackES {
    id: number
    name_th: string
    name_en: string
    aliases: string[]
    type: string
    description?: string
    releaseDate?: Date
    duration?: number
    audioFile: MediaES
    mvFile: MediaES
    album?: AlbumES
    album_id: number
    artists?: ArtistES[]
    artist_ids: number[]
    genres: string[]
    playlist_ids: number[]
    image?: MediaES
    hitCounts: number
    createdAt: Date
    updatedAt: Date
    publishedAt?: Date | null
}

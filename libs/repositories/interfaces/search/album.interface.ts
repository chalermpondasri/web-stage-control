import { ArtistES } from './artist.interface'
import { MediaES } from './media.interface'
import { TrackES } from './track.interface'

export interface AlbumES {
    id: number
    name_th: string
    name_en: string
    releaseDate?: Date
    image?: MediaES
    type: string
    artists?: ArtistES[]
    artist_ids?: number[]
    tracks?: TrackES[]
    track_ids?: number[]
    createdAt: Date
    updatedAt: Date
    publishedAt?: Date | null
}

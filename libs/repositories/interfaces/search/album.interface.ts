import { ArtistES } from './artist.interface'
import { MediaES } from './media.interface'
import { TrackES } from './track.interface'

export interface AlbumES {
    id: number
    createdAt: Date
    updatedAt: Date
    publishedAt?: Date
    title: string
    releaseDate?: Date
    coverImage?: MediaES
    artist?: ArtistES
    tracks: TrackES[]
    locale: string
    localizations?: AlbumES[]
}

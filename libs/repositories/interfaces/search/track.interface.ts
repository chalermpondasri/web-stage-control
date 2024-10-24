import { AlbumES } from './album.interface'
import { ArtistES } from './artist.interface'
import { GenreES } from './genre.interface'
import { MediaES } from './media.interface'
import { PlaylistES } from './playlist.interface'

export interface TrackES {
    id: number
    publishedAt?: Date | null
    title_th: string
    title_en: string
    aliases: string[]
    duration?: number
    audioFile: MediaES
    album?: AlbumES
    artist?: ArtistES
    genres: GenreES[]
    playlists?: PlaylistES[]
    image?: MediaES
    locale?: string
    createdAt: Date
    updatedAt: Date
}

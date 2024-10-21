import { AlbumES } from './album.interface'
import { ArtistES } from './artist.interface'
import { GenreES } from './genre.interface'
import { MediaES } from './media.interface'
import { PlaylistES } from './playlist.interface'

export interface TrackES {
    id: number
    createdAt: Date
    updatedAt: Date
    publishedAt?: Date
    title_th: string
    title_en: string
    aliases: string[]
    duration?: number
    audioFile: MediaES
    album?: AlbumES
    artists?: ArtistES
    genres: GenreES[]
    playlists?: PlaylistES[]
    coverImage?: MediaES
    locale?: string
}

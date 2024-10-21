import { AlbumES } from '@libs/repositories/interfaces/search/album.interface'
import { ArtistES } from '@libs/repositories/interfaces/search/artist.interface'
import { GenreES } from '@libs/repositories/interfaces/search/genre.interface'
import { MediaES } from '@libs/repositories/interfaces/search/media.interface'
import { PlaylistES } from '@libs/repositories/interfaces/search/playlist.interface'
import { TrackES } from '@libs/repositories/interfaces/search/track.interface'

export class TrackDto {
    id: number
    createdAt: Date
    updatedAt: Date
    publishedAt?: Date
    title: string
    duration?: number
    audioFile: MediaES
    album?: AlbumES
    artist?: ArtistES
    genres: GenreES[]
    playlists?: PlaylistES[]
    coverImage?: MediaES
    locale: string
    localizations?: TrackES[]
}

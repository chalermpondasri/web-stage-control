import { AlbumES } from './album.interface'
import { MediaES } from './media.interface'
import { PlaylistES } from './playlist.interface'
import { TrackES } from './track.interface'

export interface ArtistES {
    id: number
    createdAt: Date
    updatedAt: Date
    publishedAt?: Date
    name: string
    bio?: any
    albums: AlbumES[]
    tracks: TrackES[]
    image?: MediaES
    playlists: PlaylistES[]
    locale: string
    localizations?: ArtistES[]
}

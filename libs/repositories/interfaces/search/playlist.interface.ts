import { ArtistES } from './artist.interface'
import { TrackES } from './track.interface'

export interface PlaylistES {
    id: number
    createdAt: Date
    updatedAt: Date
    publishedAt?: Date
    name: string
    description?: any
    artist?: ArtistES
    tracks?: TrackES[]
}

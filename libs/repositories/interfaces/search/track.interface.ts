import { Media_Plain } from './media.interface'

export interface TrackES {
    id: number
    createdAt: Date
    updatedAt: Date
    publishedAt?: Date
    title: string
    duration?: number
    audioFile: Media_Plain
    album?: string
    artist?: string
    genres: string[]
    playlists?: string[]
    coverImage?: Media_Plain
    locale: string
    localizations?: TrackES[]
}

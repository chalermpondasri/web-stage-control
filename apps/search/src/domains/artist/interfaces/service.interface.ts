import { Observable } from 'rxjs'
import { AlbumSearchDto } from '../../track/dtos/album.dto'
import { ArtistSearchDto } from '../dtos/artist.dto'

export interface IArtistService {
    searchArtistById(id: number): Observable<ArtistSearchDto>
    searchAlbumsByArtistId(id: number): Observable<AlbumSearchDto[]>
}

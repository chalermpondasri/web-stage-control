import { Observable } from 'rxjs'
import { AlbumSearchDto } from '../../track/dtos/album.dto'
import { ArtistSearchDto } from '../dtos/artist.dto'

export interface IArtistService {
    // searchArtistsByKeyword(
    //     keyword: string,
    //     page?: number,
    //     limit?: number,
    // ): Observable<ListResponse<ArtistSearchDto | ArtistSearchDto | AlbumSearchDto>>

    searchArtistById(id: number): Observable<ArtistSearchDto>
    searchAlbumsByArtistId(id: number): Observable<AlbumSearchDto[]>
}

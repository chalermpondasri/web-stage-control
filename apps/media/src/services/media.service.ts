import {
    from,
    map,
    Observable,
} from 'rxjs'
import { IMediaService } from './interfaces/service.interface'
import { StrapiClient } from '@libs/providers/strapi-client.provider'

export class MediaService implements IMediaService {
    public constructor(
        private readonly _strapiClient: StrapiClient
    ) {
    }
    public getMediaDetail(mediaId: string): Observable<any> {
        const promise = this._strapiClient.trackApi.getTracksId(Number(mediaId), {
            params: {
                populate: '*'
            }
        })
        return from(promise).pipe(
            map(response => response.data)
        )
    }

}
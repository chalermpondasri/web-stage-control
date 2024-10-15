import { Client } from '@elastic/elasticsearch'
import { WriteResponseBase } from '@elastic/elasticsearch/lib/api/types'
import { Observable } from 'rxjs'
import { TrackES } from '../interfaces/search/track.interface'
import { ElasticsearchRepository } from './elasticsearch.repository'

export class TrackElasticRepository extends ElasticsearchRepository {
    public constructor(private readonly client: Client) {
        super(client)
    }

    public addTrack(track: TrackES): Observable<WriteResponseBase> {
        return this.indexDocument('tracks', track)
    }
}

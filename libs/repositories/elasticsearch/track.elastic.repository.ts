import { Client } from '@elastic/elasticsearch'
import { WriteResponseBase } from '@elastic/elasticsearch/lib/api/types'
import { ElasticConstant } from '@libs/common/constants/elastic.constant'
import { from, Observable } from 'rxjs'
import { TrackES } from '../interfaces/search/track.interface'
import { ElasticsearchRepository } from './elasticsearch.repository'

export class TrackElasticRepository extends ElasticsearchRepository {
    public constructor(private readonly client: Client) {
        super(client)
    }

    public addTrack(track: TrackES): Observable<WriteResponseBase> {
        return this.indexDocument(ElasticConstant.INDICE.TRACK, track)
    }

    public updateTrack(track: Partial<TrackES>): Observable<WriteResponseBase> {
        return from(
            this.client.update({
                index: ElasticConstant.INDICE.TRACK,
                id: track.id.toString(),
                body: {
                    doc: track,
                },
            }),
        )
    }

    public deleteTrack(id: string): Observable<WriteResponseBase> {
        return from(
            this.client.delete({
                index: ElasticConstant.INDICE.TRACK,
                id: id,
            }),
        )
    }
}

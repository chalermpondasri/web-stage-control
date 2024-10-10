import { Client } from '@elastic/elasticsearch'
import { WriteResponseBase } from '@elastic/elasticsearch/lib/api/types'
import { ProviderName } from '@libs/common/constants/providerName'
import { Inject } from '@nestjs/common'
import { Observable } from 'rxjs'
import { TrackES } from '../interfaces/search/track.interface'
import { ElasticsearchRepository } from './elasticsearch.repository'

export class TrackElasticRepository extends ElasticsearchRepository {
    public constructor(
        @Inject(ProviderName.ELASTIC_CLIENT)
        private client: Client,
    ) {
        super(client)
    }

    addTrack = (track: TrackES): Observable<WriteResponseBase> => {
        for (const key in track) {
            if (track[key] === undefined) {
                delete track[key]
            }
        }

        return this.indexDocument('tracks', track)
    }
}

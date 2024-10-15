import { Client } from '@elastic/elasticsearch'
import { WriteResponseBase } from '@elastic/elasticsearch/lib/api/types'
import { ElasticConstant } from '@libs/common/constants/elastic.constant'
import { Logger } from '@nestjs/common'
import { catchError, from, map, Observable, switchMap } from 'rxjs'
import { TrackES } from '../interfaces/search/track.interface'
import { ElasticsearchRepository } from './elasticsearch.repository'

export class TrackElasticRepository extends ElasticsearchRepository {
    private readonly _logger: Logger = new Logger(TrackElasticRepository.name)

    public constructor(private readonly client: Client) {
        super(client)
    }

    public addTrack(track: TrackES): Observable<WriteResponseBase> {
        return this.indexDocument(ElasticConstant.INDICE.TRACK, track)
    }

    public updateTrack(track: Partial<TrackES>): Observable<WriteResponseBase> {
        return from(
            this.client.search({
                index: ElasticConstant.INDICE.TRACK,
                body: {
                    query: {
                        match: {
                            id: track.id,
                        },
                    },
                },
            }),
        ).pipe(
            map((response) => {
                const id = response.hits.hits[0]?._id
                if (!id) {
                    // If not found, create instead
                    return this.addTrack(track as TrackES)
                }
                this._logger.log(`Track found: ${id}`)
                return id
            }),
            switchMap((id) =>
                from(
                    this.client.update({
                        index: ElasticConstant.INDICE.TRACK,
                        id: id.toString(),
                        body: {
                            doc: track,
                        },
                    }),
                ),
            ),
            catchError((error) => {
                this._logger.error(`Error updating track: ${error.message}`)
                throw error
            }),
        )
    }

    public deleteTrack(track: Partial<TrackES>): Observable<WriteResponseBase> {
        return from(
            this.client.search({
                index: ElasticConstant.INDICE.TRACK,
                body: {
                    query: {
                        match: {
                            id: track.id,
                        },
                    },
                },
            }),
        ).pipe(
            map((response) => {
                const id = response.hits.hits[0]?._id
                if (!id) {
                    throw new Error('Track not found on elasticsearch')
                }
                this._logger.log(`Track found: ${id}`)
                return id
            }),
            switchMap((id) =>
                from(
                    this.client.delete({
                        index: ElasticConstant.INDICE.TRACK,
                        id: id.toString(),
                    }),
                ),
            ),
            catchError((error) => {
                this._logger.error(`Error deleting track: ${error.message}`)
                throw error
            }),
        )
    }
}

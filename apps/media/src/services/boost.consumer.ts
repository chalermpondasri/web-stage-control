import {
    Inject,
    Injectable,
    Logger,
} from '@nestjs/common'
import { getRabbitSubscribeConfig } from '../../../mq-consumer/src/utils/consumer.util'
import {
    EXCHANGES,
    ProviderName,
    QUEUES,
} from '@libs/common/constants'
import {
    Nack,
    RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq'
import { Repository } from 'typeorm'
import { Playlist } from '@libs/entities/playlist.entity'
import { User } from '@libs/entities/user.entity'
import { TrackES } from '@libs/repositories/interfaces/search/track.interface'
import {
    concatMap,
    from,
    lastValueFrom,
    mergeMap,
    Observable,
    tap,
} from 'rxjs'
import { QueueState } from '@libs/common/models/media/queue-state.enum'
import { EventSubjectFactory } from '@libs/providers/event-subject.provider'
import { TrackBoostedSse } from '@libs/common/models/media/sse/track-boosted.sse'
import { TrackElasticRepository } from '@libs/repositories/elasticsearch/track.elastic.repository'
import { AlbumElasticRepository } from '@libs/repositories/elasticsearch/album.elastic.repository'

export interface MediaBoostEventPayload {
    user: User
    /**
     * Elastic Track ID
     */
    trackId: number
    communityId: string
    boostCoin: number
}

const rabbitSubscribeConfig = getRabbitSubscribeConfig(
    QUEUES.MEDIA_BOOST,
    'media.boost',
    EXCHANGES.BOOST_DL,
    'media.boost.dlq',
)

@Injectable()
export class BoostConsumer {
    private readonly _logger = new Logger(BoostConsumer.name)

    public constructor(
        @Inject(ProviderName.PLAYLIST_REPOSITORY)
        private readonly _playlistRepository: Repository<Playlist>,
        @Inject(ProviderName.SSE_PLAYLIST_SUBJECT_FACTORY)
        private readonly _playlistSubjectEvent: EventSubjectFactory,
        @Inject(ProviderName.TRACK_REPOSITORY)
        private readonly _trackElasticRepository: TrackElasticRepository,
        @Inject(ProviderName.ALBUM_REPOSITORY)
        private readonly _albumElasticRepository: AlbumElasticRepository,
    ) {
    }

    @RabbitSubscribe(rabbitSubscribeConfig)
    public async handler(data: MediaBoostEventPayload): Promise<void | Nack> {
        const observable$ = ({
                                 trackId,
                                 boostCoin,
                                 communityId,
                             }: MediaBoostEventPayload): Observable<any> => from(this._playlistRepository.findOneBy({
            communityId,
            trackId,
            queueState: QueueState.QUEUED,
        }))
            .pipe(
                concatMap(result => {
                        if (!result) {
                            return this._trackElasticRepository.searchTrackById(trackId).pipe(
                                mergeMap(result => {
                                    const track = <TrackES>result.hits.hits[0]._source
                                    return this._albumElasticRepository.getTrackRelatedData(track, true, true)
                                }),
                                mergeMap((track: TrackES) => {
                                    const model = this._playlistRepository.create({
                                        communityId,
                                        coverImage: track.image?.url,
                                        trackId: track.id,
                                        title: track.name_th ?? track.name_en,
                                        artist: !!track.artists ? track.artists.map(t => t.name_th).join(',') : '',
                                        totalBoost: boostCoin,
                                        duration: track.duration,
                                        queueState: QueueState.QUEUED,
                                        albumId: track?.album_id,
                                        albumName: { en: track?.album?.name_en, th: track?.album?.name_th, cn: null },
                                        albumImageUrl: track?.album?.image?.url,
                                    })
                                    return this._playlistRepository.save(model)
                                }),
                            )
                        }

                        return from(this._playlistRepository.increment({ id: result.id }, 'totalBoost', boostCoin)).pipe(
                            concatMap(() => this._playlistRepository.findOneBy({ id: result.id })),
                        )
                    },
                ),
                tap((list => {
                        this._propagateTrackBoostSSE(communityId, list)
                    }
                )),
                tap((result) => {
                    this._logger.log(`Media Add/Boost: ${result.id} [${boostCoin}]`)
                }),
            )

        try {
            await lastValueFrom(observable$(data))
        } catch (err) {
            this._logger.error(err)
            return new Nack(true)
        }
    }

    private _propagateTrackBoostSSE(communityId: string, list: Playlist) {
        const data: TrackBoostedSse = {
            transactionId: list.id,
            trackId: list.trackId,
            timestamp: (new Date()).toISOString(),
            totalCoins: list.totalBoost,
            boostedBy: list.totalBoost,
            track: {
                trackId: list.trackId,
                coverImage: list.coverImage,
                title: {
                    th: list.title,
                    en: list.title,
                    cn: null,
                },
                artists: list.artist.split(','),
                totalCoins: list.totalBoost,
                album: {
                    albumName: list.albumName,
                },
            },
        }
        this._playlistSubjectEvent.push(communityId, 'ITEM_UPDATE', data)
    }
}
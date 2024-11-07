import { BoostRequest } from '@libs/common/models/media/boost.request'
import {
    from,
    map,
    mergeMap,
    Observable,
    tap,
    throwError,
} from 'rxjs'
import { IBoostService } from './interfaces/service.interface'
import { StrapiClient } from '@libs/providers/strapi-client.provider'
import { RequestContext } from '@libs/providers/request-context.provider'
import { User } from '@libs/entities/user.entity'
import {
    FindOptionsWhere,
    Repository,
} from 'typeorm'
import {
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common'
import { ErrorEnum } from '@libs/common/constants/error.enum'
import { Playlist } from '@libs/entities/playlist.entity'
import { QueueState } from '@libs/common/models/media/queue-state.enum'
import { TrackElasticRepository } from '@libs/repositories/elasticsearch/track.elastic.repository'
import {
    SearchTotalHits,
} from '@elastic/elasticsearch/lib/api/types'
import { TrackES } from '@libs/repositories/interfaces/search/track.interface'
import { TrackBoostedSse } from '@libs/common/models/media/sse/track-boosted.sse'
import { EventSubjectFactory } from '@libs/providers/event-subject.provider'

export class BoostService implements IBoostService {
    public constructor(
        private readonly _cmsRepository: StrapiClient,
        private readonly _requestContext: RequestContext,
        private readonly _userRepository: Repository<User>,
        private readonly _playlistRepository: Repository<Playlist>,
        private readonly _trackElasticRepository: TrackElasticRepository,
        private readonly _playlistSubjectEvent: EventSubjectFactory
    ) {
    }

    public boostMedia(request: BoostRequest): Observable<{success:boolean}> {
        return from(this._userRepository.findOneBy({ id: this._requestContext.identityInfo.userId })).pipe(
            mergeMap(user => {
                if (user.remainCoins < request.boostCoin) {
                    return throwError(() => new BadRequestException(ErrorEnum.BOOST_INSUFFICIENT_COIN))
                }

                return from(this._userRepository.decrement({ id: this._requestContext.identityInfo.userId }, 'remainCoins', request.boostCoin)).pipe(
                    map(() => user),
                )
            }),
            mergeMap(() => {

                const findExistingOpts: FindOptionsWhere<Playlist> = {
                    communityId: request.communityId,
                    queueState: QueueState.QUEUED,
                    trackId: request.trackId,
                }

                return from(this._playlistRepository.findOneBy(findExistingOpts)).pipe(
                    mergeMap(playlist => {
                        if (!!playlist) {
                            return from(this._playlistRepository.increment(findExistingOpts, 'totalBoost', request.boostCoin)).pipe(
                                mergeMap(() => from(this._playlistRepository.findOneBy(findExistingOpts)))
                            )
                        }

                        return this._trackElasticRepository.searchTrackById(request.trackId).pipe(
                            mergeMap(result => {
                                if ((result.hits.total as SearchTotalHits).value === 0) {
                                    return throwError(() => new InternalServerErrorException(ErrorEnum.MEDIA_TRACK_NOT_FOUND))
                                }

                                const track = <TrackES> result.hits.hits[0]._source

                                const model = this._playlistRepository.create()
                                model.communityId = request.communityId
                                model.coverImage = track.image?.url
                                model.trackId = track.id
                                model.title = track.name_th ?? track.name_en
                                model.artist = !!track.artists ? track.artists.join(',') : ''
                                model.totalBoost = request.boostCoin
                                model.duration = track.duration
                                model.queueState = QueueState.QUEUED
                                model.albumId = track.album.id
                                model.albumName = {en: track.album.name_en, th: track.album.name_th, cn: null}
                                model.albumImageUrl = track.album.image.url

                                return this._playlistRepository.save(model)
                            }),
                        )
                    }),
                    tap(list => {
                        const data: TrackBoostedSse = {
                            trackId:list.trackId,
                            timestamp: (new Date()).toISOString(),
                            totalCoins: list.totalBoost,
                            boostedBy: request.boostCoin,
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
                            }
                        }
                        this._playlistSubjectEvent.push(request.communityId, 'ITEM_UPDATE', data)
                    }),
                    map(() => ({success: true})),
                )
            }),
        )
    }
}
import { BoostRequest } from '@libs/common/models/media/boost.request'
import {
    concatMap,
    from,
    map,
    mergeMap,
    Observable,
    tap,
    throwError,
} from 'rxjs'
import { IBoostService } from './interfaces/service.interface'
import { RequestContext } from '@libs/providers/request-context.provider'
import { User } from '@libs/entities/user.entity'
import {
    FindOptionsWhere,
    Repository,
} from 'typeorm'
import {
    BadRequestException,
    Logger,
    LoggerService,
} from '@nestjs/common'
import { ErrorEnum } from '@libs/common/constants/error.enum'
import { Playlist } from '@libs/entities/playlist.entity'
import { QueueState } from '@libs/common/models/media/queue-state.enum'
import { TrackElasticRepository } from '@libs/repositories/elasticsearch/track.elastic.repository'
import { TrackES } from '@libs/repositories/interfaces/search/track.interface'
import { TrackBoostedSse } from '@libs/common/models/media/sse/track-boosted.sse'
import { EventSubjectFactory } from '@libs/providers/event-subject.provider'
import { AlbumElasticRepository } from '@libs/repositories/elasticsearch/album.elastic.repository'
import {
    CoinDeduction,
    DeductionEvent,
} from '@libs/entities/coin-deduction.entity'

export class BoostService implements IBoostService {
    private readonly _logger: LoggerService

    public constructor(
        private readonly _requestContext: RequestContext,
        private readonly _userRepository: Repository<User>,
        private readonly _playlistRepository: Repository<Playlist>,
        private readonly _trackElasticRepository: TrackElasticRepository,
        private readonly _playlistSubjectEvent: EventSubjectFactory,
        private readonly _albumElasticRepository: AlbumElasticRepository,
        private readonly _coinDeductionRepository: Repository<CoinDeduction>,
    ) {
        this._logger = new Logger(BoostService.name)

    }

    public boostMedia(request: BoostRequest): Observable<{ success: boolean }> {
        return from(this._userRepository.findOneBy({ id: this._requestContext.identityInfo.userId })).pipe(
            concatMap(user => {
                if (user.remainCoins < request.boostCoin) {
                    return throwError(() => new BadRequestException(ErrorEnum.BOOST_INSUFFICIENT_COIN))
                }

                const promise = this._userRepository.decrement({ id: user.id }, 'remainCoins', request.boostCoin)

                return from(promise).pipe(
                    mergeMap(() => {
                        const model = this._coinDeductionRepository.create({
                            communityId: request.communityId,
                            trackId: request.trackId,
                            userId: user.id,
                            deductedAt: new Date(),
                            deductedCoin: request.boostCoin,
                            deductionEvent: DeductionEvent.BOOST,
                        })
                        return from(this._coinDeductionRepository.save(model))
                    }),
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
                                mergeMap(() => from(this._playlistRepository.findOneBy(findExistingOpts))),
                            )
                        }

                        return this._trackElasticRepository.searchTrackById(request.trackId).pipe(
                            mergeMap(result => {
                                const track = <TrackES>result.hits.hits[0]._source
                                return this._albumElasticRepository.getTrackRelatedData(track, true, true)
                            }),
                            mergeMap(result => {
                                const track = result

                                const model = this._playlistRepository.create()
                                model.communityId = request.communityId
                                model.coverImage = track.image?.url
                                model.trackId = track.id
                                model.title = track.name_th ?? track.name_en
                                model.artist = !!track.artists ? track.artists.map(t => t.name_th).join(',') : ''
                                model.totalBoost = request.boostCoin
                                model.duration = track.duration
                                model.queueState = QueueState.QUEUED
                                model.albumId = track?.album_id
                                model.albumName = { en: track?.album?.name_en, th: track?.album?.name_th, cn: null }
                                model.albumImageUrl = track?.album?.image?.url

                                return this._playlistRepository.save(model)
                            }),
                        )
                    }),
                    tap(list => {
                        const data: TrackBoostedSse = {
                            trackId: list.trackId,
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
                                album: {
                                    albumName: list.albumName,
                                },
                            },
                        }
                        this._playlistSubjectEvent.push(request.communityId, 'ITEM_UPDATE', data)
                    }),
                    map(() => ({ success: true })),
                )
            }),
        )
    }
}
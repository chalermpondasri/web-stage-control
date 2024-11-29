import { BoostRequest } from '@libs/common/models/media/boost.request'
import {
    concatMap,
    forkJoin,
    from,
    map,
    mergeMap,
    Observable,
    of,
    tap,
    throwError,
} from 'rxjs'
import { IBoostService } from './interfaces/service.interface'
import { RequestContext } from '@libs/providers/request-context.provider'
import { User } from '@libs/entities/user.entity'
import { Repository } from 'typeorm'
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
import { isUUID } from 'class-validator'
import { AddToQueueRequest } from '@libs/common/models/media/add-to-queue.request'

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

    private _checkUserRemainCoin(userId: string, coinToUse: number): Observable<User>{
        return  from(this._userRepository.findOneBy({ id: userId }))
            .pipe(
                concatMap(user => {
                        if (user.remainCoins < coinToUse) {
                            return throwError(() => new BadRequestException(ErrorEnum.BOOST_INSUFFICIENT_COIN))
                        }
                        return of(user)
                    },
                ),
            )
    }

    public addToQueue(communityId: string, request: AddToQueueRequest): Observable<any> {

        const checkIfNotExistInPlaylist = () => from(this._playlistRepository.findOneBy({
            communityId,
            trackId: request.trackId,
            queueState: QueueState.QUEUED,
        })).pipe(
            mergeMap(playlist => {
                if (!!playlist) {
                    return throwError(() => new BadRequestException(ErrorEnum.PLAYLIST_TRACK_EXISTED))
                }
                return of(null)
            }),
        )

        if (!isUUID(communityId)) {
            throw new BadRequestException(ErrorEnum.COMMUNITY_NOT_FOUND)
        }

        return forkJoin([
            this._checkUserRemainCoin(this._requestContext.identityInfo.userId, request.boostCoin),
            checkIfNotExistInPlaylist(),
        ]).pipe(
            mergeMap(([user]) => {
                return from(this._userRepository.decrement({ id: user.id }, 'remainCoins', request.boostCoin)).pipe(
                    mergeMap(() => {
                        const model = this._coinDeductionRepository.create({
                            communityId: communityId,
                            trackId: request.trackId,
                            userId: user.id,
                            deductedAt: new Date(),
                            deductedCoin: request.boostCoin,
                            deductionEvent: DeductionEvent.BOOST,
                        })
                        return from(this._coinDeductionRepository.save(model))
                    }),
                    map(() => ({ user })),
                )
            }),
            mergeMap(({user}) => {
                return this._trackElasticRepository.searchTrackById(request.trackId).pipe(
                    mergeMap(result => {
                        const track = <TrackES>result.hits.hits[0]._source
                        return this._albumElasticRepository.getTrackRelatedData(track, true, true)
                    }),
                    map(track => ({user, track}))
                )
            }),
            mergeMap(({user, track}) => {
                const model = this._playlistRepository.create({
                    communityId,
                    coverImage:  track.image?.url,
                    trackId: track.id,
                    title: track.name_th ?? track.name_en,
                    artist: !!track.artists ? track.artists.map(t => t.name_th).join(',') : '',
                    totalBoost: request.boostCoin,
                    duration: track.duration,
                    queueState: QueueState.QUEUED,
                    albumId: track?.album_id,
                    albumName: { en: track?.album?.name_en, th: track?.album?.name_th, cn: null },
                    albumImageUrl: track?.album?.image?.url
                })
                return this._playlistRepository.save(model)
            }),
            tap((list => {
                this._propagateTrackBoostSSE(communityId, list)
            })),
            map(() => ({success: true}))

        )

    }
    public _propagateTrackBoostSSE( communityId: string,list: Playlist) {
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

    public boostMedia(communityId: string, request: BoostRequest): Observable<{ success: boolean }> {

        communityId = communityId || request.communityId
        if (!isUUID(communityId)) {
            throw new BadRequestException(ErrorEnum.COMMUNITY_NOT_FOUND)
        }

        const checkPlaylistAvailabilities = () => from(this._playlistRepository.findOneBy({
            communityId,
            trackId: request.trackId,
            queueState: QueueState.QUEUED,
        })).pipe(
            mergeMap(playlist => {
                if (!playlist) {
                    return throwError(() => new BadRequestException(ErrorEnum.PLAYLIST_TRACK_NOT_FOUND))
                }
                return of(playlist)
            }),
        )

        return forkJoin([
            this._checkUserRemainCoin(this._requestContext.identityInfo.userId, request.boostCoin),
            checkPlaylistAvailabilities(),
        ]).pipe(
            mergeMap(([user, playlist]) => {
                const promise = this._userRepository.decrement({ id: user.id }, 'remainCoins', request.boostCoin)

                return from(promise).pipe(
                    mergeMap(() => {
                        const model = this._coinDeductionRepository.create({
                            communityId: communityId,
                            trackId: request.trackId,
                            userId: user.id,
                            deductedAt: new Date(),
                            deductedCoin: request.boostCoin,
                            deductionEvent: DeductionEvent.BOOST,
                        })
                        return from(this._coinDeductionRepository.save(model))
                    }),
                    map(() => ({ user, playlist })),
                )
            }),
            mergeMap(({ user, playlist }) => {
                return from(this._playlistRepository.increment({ id: playlist.id }, 'totalBoost', request.boostCoin)).pipe(
                    mergeMap(() => this._playlistRepository.findOneBy({id: playlist.id})),
                    tap((list => {
                        this._propagateTrackBoostSSE(communityId, list)
                    })),
                )
            }),
            map(() => ({ success: true })),
        )
    }
}
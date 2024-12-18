import { AccessTokenDto } from '@libs/common/models/common/token.dto'
import { StageRegisterRequest } from '@libs/common/models/community/stage-register.request'
import {
    catchError,
    forkJoin,
    from,
    map,
    mergeMap,
    Observable,
    of,
    tap,
    throwError,
} from 'rxjs'
import {
    IAdsService,
    IStageService,
} from './interfaces/service.interface'
import {
    FindOptionsWhere,
    Repository,
} from 'typeorm'
import { Stage } from '@libs/entities/stage.entity'
import {
    BadRequestException,
    UnauthorizedException,
} from '@nestjs/common'
import { ITokenizationService } from '@libs/providers/tokenization/tokenization-service.interface'
import { plainToInstance } from 'class-transformer'
import { MediaPlayRequest } from '@libs/common/models/media/media-play.request'
import { EventSubjectFactory } from '@libs/providers/event-subject.provider'
import {
    PlayedMedia,
    Playlist,
} from '@libs/entities/playlist.entity'
import { QueueState } from '@libs/common/models/media/queue-state.enum'
import { PlaybackPlaySse } from '@libs/common/models/media/sse/playback-play.sse'
import { ErrorEnum } from '@libs/common/constants/error.enum'
import { ICacheService } from '@libs/providers/redis'
import { ProgressUpdateRequest } from '@libs/common/models/community/progress-update.request'
import { rethrow } from '@nestjs/core/helpers/rethrow'
import { SuccessDto } from '@libs/common/models/common/success.dto'
import { IDiscordAdapter } from '@libs/utilities/adapter/interface/adapter.interface'
import { StageLoggingRequest } from '@libs/common/models/media/stage-logging.request'

export class StageService implements IStageService {
    public constructor(
        private readonly _stageRepository: Repository<Stage>,
        private readonly _tokenizationService: ITokenizationService,
        private readonly _playlistSubject: EventSubjectFactory,
        private readonly _playlistRepository: Repository<Playlist>,
        private readonly _playedMediaRepository: Repository<PlayedMedia>,
        private readonly _cacheService: ICacheService,
        private readonly _adsService: IAdsService,
        private readonly _loggingDiscordService: IDiscordAdapter,
    ) {
    }

    public progressUpdate(communityId: string, progressUpdateRequest: ProgressUpdateRequest): Observable<SuccessDto> {
        const playingTrackOpts: FindOptionsWhere<Playlist> = {
            communityId,
            id: progressUpdateRequest.transactionId,
            queueState: QueueState.PLAYING,
        }

        return from(this._playlistRepository.findOneByOrFail(playingTrackOpts)).pipe(
            mergeMap(track => {
                track.progressUpdatedAt = progressUpdateRequest.timestamp
                track.trackProgress = progressUpdateRequest.trackProgress
                return from(this._playlistRepository.save(track)).pipe(map(() => track))
            }),
            tap(track => {
                const playedItem: PlaybackPlaySse = {
                    transactionId: track.id,
                    artistImage: track.coverImage,
                    artists: track.artist.split(','),
                    coverImage: track.coverImage,
                    trackDuration: track.duration,
                    trackId: track.trackId,
                    title: {
                        th: track.title,
                        en: track.title,
                        cn: null,
                    },
                    playedAt: track.playedAt,
                    progressUpdatedAt: track.progressUpdatedAt,
                    trackProgress: track.trackProgress,
                }
                this._playlistSubject.push(communityId, 'TRACK_PROGRESS_UPDATE', plainToInstance(PlaybackPlaySse, playedItem))
            }),
            map(() => ({success: true})),
            catchError(err => {
                console.error(err)
                rethrow(new BadRequestException(ErrorEnum.PLAYLIST_TRACK_NOT_FOUND))
            })
        )
    }

    public freeze(communityId: string) {
        this._playlistSubject.push(communityId, 'PLAYLIST_FREEZE', {})
    }

    public unfreeze(communityId: string) {
        this._playlistSubject.push(communityId, 'PLAYLIST_UNFREEZE', {})
    }

    public play(communityId: string, mediaId: string, request: MediaPlayRequest): Observable<SuccessDto> {
        const targetTrackOpts: FindOptionsWhere<Playlist> = {
            communityId,
            id: request.transactionId,
            queueState: QueueState.QUEUED,
        }

        const playingTrackOpts: FindOptionsWhere<Playlist> = {
            communityId,
            queueState: QueueState.PLAYING,
        }

        const cacheKey = `${StageService.name}_play_${communityId}`


        const updatePlayingTrackObs$ = (track: Playlist | void) => of(track).pipe(
            tap((playingTrack) => {
                if (!!playingTrack) {
                    playingTrack.queueState = QueueState.PLAYED
                    const id = playingTrack.id
                    delete playingTrack.id
                    return forkJoin([
                        from(this._playedMediaRepository.save(playingTrack)),
                        from(this._playlistRepository.delete({ id })),
                    ])
                }
            }),
            mergeMap(() => from(this._playlistRepository.findOneBy(targetTrackOpts)).pipe(
                mergeMap(track => {
                    if (!track) {
                        return throwError(() => new BadRequestException(ErrorEnum.PLAYLIST_TRACK_NOT_FOUND))
                    }

                    track.queueState = QueueState.PLAYING
                    track.playedAt = request.timestamp

                    return from(this._playlistRepository.save(track))

                }),
                tap(newTrack => {

                    const playedItem: PlaybackPlaySse = {
                        transactionId: newTrack.id,
                        artistImage: newTrack.coverImage,
                        artists: newTrack.artist.split(','),
                        coverImage: newTrack.coverImage,
                        trackDuration: newTrack.duration,
                        trackId: newTrack.trackId,
                        title: {
                            th: newTrack.title,
                            en: newTrack.title,
                            cn: null,
                        },
                        playedAt: request.timestamp,
                        progressUpdatedAt: newTrack.progressUpdatedAt,
                        trackProgress: newTrack.trackProgress,
                    }
                    this._playlistSubject.push(communityId, 'ITEM_PLAYING', plainToInstance(PlaybackPlaySse, playedItem))
                    this.unfreeze(communityId)
                }),
            )),
            map(() => ({success: true}))
        )

        return from(this._playlistRepository.findOneBy(playingTrackOpts)).pipe(
            mergeMap(playingTrack => {

                if (!!playingTrack && playingTrack.id === request.transactionId) {
                    return throwError(() => new BadRequestException(ErrorEnum.PLAYLIST_TRACK_ALREADY_PLAYING))
                }
                return of(playingTrack)
            }),
            mergeMap(playingTrack => {
                return this._cacheService.getAndSet( cacheKey, () => {
                    return of({
                        trackRemainsToPlayAds: 0,
                        adsPlayed: 0,
                        lastPlayed: new Date().toISOString(),
                        lastPlayedTransaction: playingTrack?.id
                    })
                }).pipe(
                    mergeMap(cacheData => {
                        cacheData.lastPlayedTransaction = playingTrack?.id

                        if(cacheData.trackRemainsToPlayAds > 0) {

                            cacheData.trackRemainsToPlayAds--
                            cacheData.lastPlayed = new Date().toISOString()

                            return this._cacheService.set(cacheKey, cacheData).pipe(
                                mergeMap(() => updatePlayingTrackObs$(playingTrack))
                            )
                        }

                        return this._adsService.getAds({communityId}).pipe(
                            mergeMap(ads => {
                                const adsToPlay = ads[cacheData.adsPlayed % ads.length]
                                cacheData.adsPlayed++
                                cacheData.trackRemainsToPlayAds = 2

                                return this._cacheService.set(cacheKey, cacheData).pipe(
                                    map(() => {
                                        return plainToInstance(SuccessDto, {
                                            success: false,
                                            data: {
                                                id: adsToPlay.id,
                                                ...adsToPlay.attributes,
                                                media: adsToPlay?.attributes?.media?.data?.attributes
                                            }
                                        })
                                    })
                                )
                            }),
                            catchError(() => {
                                return of(plainToInstance(SuccessDto, {
                                    success: true,
                                    message: 'no ads to play'
                                }))
                            })
                        )

                    }),
                )
            }),

        )

    }

    public pause(communityId: string, mediaId: string, request: MediaPlayRequest): Observable<any> {
        throw new Error('Method not implemented.')
    }

    public registerStage(request: StageRegisterRequest): Observable<AccessTokenDto> {
        return from(this._stageRepository.findOneBy({
            communityId: request.communityId,
            authorizationCode: request.authorizationCode,
        })).pipe(
            mergeMap(result => {
                if (!result) {
                    return throwError(() => new UnauthorizedException())
                }

                result.lastActivity = new Date()
                result.location = request.location

                const payload = {
                    type: 'stage',
                    communityId: request.communityId,
                    stageId: result.id,
                    startDate: result.community.startDate,
                    endDate: result.community.endDate,
                }

                return from(this._stageRepository.save(result)).pipe(
                    map(() => payload),
                )

            }),
            map(payload => {
                return plainToInstance(AccessTokenDto, {
                    accessToken: this._tokenizationService.createAccessToken(payload, { lifetime: true }),
                })
            }),
        )
    }

    public loggingMessage(body: StageLoggingRequest): Observable<boolean> {
        const content = `[${body.subject}] : ${body.message}`
        return this._loggingDiscordService.sendMessage(content)
    }
}

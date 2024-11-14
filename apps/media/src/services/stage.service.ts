import { AccessTokenDto } from '@libs/common/models/common/token.dto'
import { StageRegisterRequest } from '@libs/common/models/community/stage-register.request'
import {
    forkJoin,
    from,
    map,
    mergeMap,
    Observable,
    of,
    tap,
    throwError,
} from 'rxjs'
import { IStageService } from './interfaces/service.interface'
import {
    FindOptionsWhere,
    Not,
    Repository,
} from 'typeorm'
import { Stage } from '@libs/entities/stage.entity'
import { UnauthorizedException } from '@nestjs/common'
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

export class StageService implements IStageService {
    public constructor(
        private readonly _stageRepository: Repository<Stage>,
        private readonly _tokenizationService: ITokenizationService,
        private readonly _playlistSubject: EventSubjectFactory,
        private readonly _playlistRepository: Repository<Playlist>,
        private readonly _playedMediaRepository: Repository<PlayedMedia>,
    ) {
    }

    public play(communityId: string, mediaId: string, request: MediaPlayRequest): Observable<any> {
        const findOneOpts: FindOptionsWhere<Playlist> = {
            communityId,
            trackId: Number(mediaId),
            queueState: QueueState.QUEUED,
        }

        const playingTrackOpts: FindOptionsWhere<Playlist> = {
            communityId,
            queueState: QueueState.PLAYING,
            trackId: Not(Number(mediaId)),
        }

        return from(this._playlistRepository.findOneBy(playingTrackOpts)).pipe(
            mergeMap(playingTrack => {
                if (!!playingTrack) {
                    playingTrack.queueState = QueueState.PLAYED
                    return forkJoin([
                        from(this._playedMediaRepository.save(playingTrack)),
                        from(this._playlistRepository.delete(playingTrack)),
                    ])
                }

                return of(null)
            }),
            mergeMap(() => from(this._playlistRepository.findOneBy(findOneOpts)).pipe(
                mergeMap(track => {
                    track.queueState = QueueState.PLAYING
                    track.playedAt = request.timestamp
                    return from(this._playlistRepository.save(track))
                }),
                tap(newTrack => {

                    const playedItem: PlaybackPlaySse = {
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
                    }
                    this._playlistSubject.push(communityId, 'ITEM_PLAYING', plainToInstance(PlaybackPlaySse, playedItem))
                }),
            )),
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

}
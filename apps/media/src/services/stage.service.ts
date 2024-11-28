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

export class StageService implements IStageService {
    public constructor(
        private readonly _stageRepository: Repository<Stage>,
        private readonly _tokenizationService: ITokenizationService,
        private readonly _playlistSubject: EventSubjectFactory,
        private readonly _playlistRepository: Repository<Playlist>,
        private readonly _playedMediaRepository: Repository<PlayedMedia>,
    ) {
    }

    public freeze(communityId: string) {
        this._playlistSubject.push(communityId, 'PLAYLIST_FREEZE', {} )
    }
    public unfreeze(communityId: string) {
        this._playlistSubject.push(communityId, 'PLAYLIST_UNFREEZE', {} )
    }

    public play(communityId: string, mediaId: string, request: MediaPlayRequest): Observable<any> {
        const targetTrackOpts: FindOptionsWhere<Playlist> = {
            communityId,
            id: request.transactionId,
            queueState: QueueState.QUEUED,
        }

        const playingTrackOpts: FindOptionsWhere<Playlist> = {
            communityId,
            queueState: QueueState.PLAYING,
        }

        return from(this._playlistRepository.findOneBy(playingTrackOpts)).pipe(
            mergeMap(playingTrack => {

                if(!!playingTrack && playingTrack.id === request.transactionId) {
                    return throwError(() => new BadRequestException(ErrorEnum.PLAYLIST_TRACK_ALREADY_PLAYING))
                }

                if (!!playingTrack) {
                    playingTrack.queueState = QueueState.PLAYED
                    const id = playingTrack.id
                    delete playingTrack.id
                    return forkJoin([
                        from(this._playedMediaRepository.save(playingTrack)),
                        from(this._playlistRepository.delete({id})),
                    ])
                }

                return of(null)
            }),
            mergeMap(() => from(this._playlistRepository.findOneBy(targetTrackOpts)).pipe(
                mergeMap(track => {
                    if(!track) {
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
                    }
                    this._playlistSubject.push(communityId, 'ITEM_PLAYING', plainToInstance(PlaybackPlaySse, playedItem))
                    this.unfreeze(communityId)
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
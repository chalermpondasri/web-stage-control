import { Observable } from 'rxjs'
import { PlaylistDto } from '@libs/common/models/media/playlist.dto'
import { PlayingTrackDto } from '@libs/common/models/media/playing-track.dto'
import { BoostRequest } from '@libs/common/models/media/boost.request'
import { StageRegisterRequest } from '@libs/common/models/community/stage-register.request'
import { AccessTokenDto } from '@libs/common/models/common/token.dto'
import {
    MediaPauseRequest,
    MediaPlayRequest,
} from '@libs/common/models/media/media-play.request'
import { AddToQueueRequest } from '@libs/common/models/media/add-to-queue.request'
import { StageLoggingRequest } from '@libs/common/models/media/stage-logging.request'

export interface IPlaylistService {
    getPlaylist(communityId: string): Observable<PlaylistDto>
    getNowPlaying(communityId: string): Observable<PlayingTrackDto>
}

export interface IBoostService {
    boostMedia(communityId: string, request: BoostRequest):Observable<any>
    addToQueue(communityId: string, request: AddToQueueRequest):Observable<any>
}

export interface IStageService {
    registerStage(request: StageRegisterRequest): Observable<AccessTokenDto>
    play(communityId: string, mediaId: string,request: MediaPlayRequest): Observable<any>
    pause(communityId: string, mediaId: string,request: MediaPauseRequest): Observable<any>
    freeze(communityId: string): void
    unfreeze(communityId: string): void
    loggingMessage(body: StageLoggingRequest): Observable<boolean>
}

export interface IMediaService {
    getMediaDetail(mediaId: string): Observable<any>
}
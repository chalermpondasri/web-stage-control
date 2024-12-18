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
import { ProgressUpdateRequest } from '@libs/common/models/community/progress-update.request'
import { SuccessDto } from '@libs/common/models/common/success.dto'
import { StageLoggingRequest } from '@libs/common/models/media/stage-logging.request'
import { BackdropDto } from '@libs/common/models/media/backdrop.dto'
import { AdvertisementDto } from '@libs/common/models/media/advertisement.dto'

export interface IAdFilter {
    communityId?: string
}

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
    play(communityId: string, mediaId: string,request: MediaPlayRequest): Observable<SuccessDto>
    pause(communityId: string, mediaId: string,request: MediaPauseRequest): Observable<any>
    freeze(communityId: string): void
    unfreeze(communityId: string): void
    progressUpdate(communityId: string, progressUpdateRequest: ProgressUpdateRequest): Observable<SuccessDto>
    loggingMessage(body: StageLoggingRequest): Observable<boolean>
}

export interface IMediaService {
    getMediaDetail(mediaId: string): Observable<any>
}

export interface IAdsService {
    getAdsDetail(adsId: number): Observable<any>
    getAds(adsFilter?: IAdFilter):Observable<AdvertisementDto[]>
}

export interface IBackdropService {
    getByCommunityId(communityId: string): Observable<BackdropDto[]>
}
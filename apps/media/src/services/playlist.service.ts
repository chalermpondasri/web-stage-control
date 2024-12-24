import {
    from,
    map,
    mergeMap,
    Observable,
    of,
    throwError,
} from 'rxjs'
import { PlayingTrackDto } from '@libs/common/models/media/playing-track.dto'
import { PlaylistDto } from '@libs/common/models/media/playlist.dto'
import {
    FindManyOptions,
    Repository,
} from 'typeorm'
import { Community } from '@libs/entities/community.entity'
import { IPlaylistService } from './interfaces/service.interface'
import {
    BadRequestException,
    HttpException,
    HttpStatus,
} from '@nestjs/common'
import { ErrorEnum } from '@libs/common/constants/error.enum'
import { Playlist } from '@libs/entities/playlist.entity'
import { QueueState } from '@libs/common/models/media/queue-state.enum'
import {
    AlbumQueueTrackDto,
    QueueTrackDto,
} from '@libs/common/models/media/queue-track.dto'
import { StrapiClient } from '@libs/providers/strapi-client.provider'
import { plainToInstance } from 'class-transformer'
import { Locale } from '@libs/common/models'

export class PlaylistService implements IPlaylistService {
    public constructor(
        private readonly _communityRepository: Repository<Community>,
        private readonly _playlistRepository: Repository<Playlist>,
        private readonly _cmsRepository: StrapiClient,
    ) {
    }

    public getPlaylist(communityId: string): Observable<PlaylistDto> {
        return from(this._communityRepository.findOneBy({ id: communityId })).pipe(
            mergeMap(community => {

                if (!community) {
                    return throwError(() => new BadRequestException(ErrorEnum.COMMUNITY_NOT_FOUND))
                }

                const opts: FindManyOptions<Playlist> = {
                    where: { communityId: communityId, queueState: QueueState.QUEUED },
                    order: {
                        totalBoost: 'desc',
                        updatedAt: 'asc',
                    },
                }
                return from(this._playlistRepository.findAndCount(opts))
            }),
            map(([playlist]) => {

                const dto = new PlaylistDto()
                dto.communityId = communityId
                dto.queue = playlist.map(p => plainToInstance(QueueTrackDto, {
                    transactionId: p.id,
                    trackId: p.trackId,
                    title: plainToInstance(Locale, { en: p.title, th: p.title }),
                    artists: p.artist,
                    coverImage: p.coverImage,
                    totalCoins: p.totalBoost,
                    album: plainToInstance(AlbumQueueTrackDto, {
                        albumId: p.albumId,
                        albumName: p.albumName,
                        albumImageUrl: p.albumImageUrl,
                    })
                }))

                return dto

            }),
        )

    }

    public getNowPlaying(communityId: string): Observable<PlayingTrackDto> {

        return from(this._playlistRepository.findOneBy({communityId, queueState: QueueState.PLAYING})).pipe(
            mergeMap(playing => {
                if(!playing) {
                    return throwError(() => new HttpException(null,HttpStatus.NO_CONTENT))
                }
                return of(playing)
            }),
            map(playing => {
                const data: PlayingTrackDto = {
                    transactionId: playing.id,
                    artistImage: playing.coverImage,
                    artists: playing.artist.split(','),
                    coverImage: playing.coverImage,
                    playedAt: playing.playedAt,
                    title: {
                        th: playing.title || null,
                        en: playing.title || null,
                        cn: playing.title || null,
                    },
                    trackDuration: playing.duration,
                    trackId: playing.trackId,
                    album: {
                        albumId: playing.albumId || null,
                        albumName: playing.albumName || null,
                        albumImageUrl: playing.albumImageUrl || null,
                    }

                }
                return plainToInstance(PlayingTrackDto, data)
            })
        )

    }
}
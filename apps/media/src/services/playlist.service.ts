import {
    from,
    map,
    mergeMap,
    Observable,
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
import { BadRequestException } from '@nestjs/common'
import { ErrorEnum } from '@libs/common/constants/error.enum'
import { Playlist } from '@libs/entities/playlist.entity'
import { QueueState } from '@libs/common/models/media/queue-state.enum'
import { QueueTrackDto } from '@libs/common/models/media/queue-track.dto'
import { StrapiClient } from '@libs/providers/strapi-client.provider'
import { plainToInstance } from 'class-transformer'
import { Locale } from '@libs/common/models'
import dayjs from 'dayjs'

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
                    take: 5,
                    order: {
                        totalBoost: 'desc',
                        updatedAt: 'desc',
                    },
                }
                return from(this._playlistRepository.findAndCount(opts))
            }),
            map(([playlist, total]) => {

                // TODO add list from cms
                const dto = new PlaylistDto()
                dto.communityId = communityId
                dto.queue = [
                    plainToInstance(QueueTrackDto, {
                        title: plainToInstance(Locale, { en: 'Wad Wai', th: 'วาดไว้' }),
                        artists: ['Bowkylion'],
                        coverImage: 'https://placehold.co/400?text=Bowkylion',
                        totalCoins: 999,
                    }),
                    plainToInstance(QueueTrackDto, {
                        title: plainToInstance(Locale, { en: 'Day One', th: 'Day One' }),
                        artists: ['PUN'],
                        coverImage: 'https://placehold.co/400?text=PUN',
                        totalCoins: 777,
                    }),
                    plainToInstance(QueueTrackDto, {
                        title: plainToInstance(Locale, { en: 'Proud', th: 'Proud' }),
                        artists: ['fellow fellow'],
                        coverImage: 'https://placehold.co/400?text=fellow fellow',
                        totalCoins: 666,
                    }),
                    plainToInstance(QueueTrackDto, {
                        title: plainToInstance(Locale, { en: 'Perfume', th: 'น้ำหอม' }),
                        artists: ['COCKTAIL', 'Papa Roach?'],
                        coverImage: 'https://placehold.co/400?text=COCKTAIL',
                        totalCoins: 666,
                    }),
                ]

                return dto

            }),
        )

    }

    public getNowPlaying(communityId: string): Observable<PlayingTrackDto> {
        return from(this._communityRepository.findOneBy({ id: communityId })).pipe(
            mergeMap(community => {

                if (!community) {
                    return throwError(() => new BadRequestException(ErrorEnum.COMMUNITY_NOT_FOUND))
                }

                return from(this._playlistRepository.findOneBy({
                    queueState: QueueState.PLAYING,
                    communityId,
                }))
            }),
            map((result) => {

                return plainToInstance(PlayingTrackDto, {
                    title: plainToInstance(Locale, { en: 'Golden Hours', th: 'Golden Hours' }),
                    artists: ['Billkin'],

                    playedAt: dayjs().subtract(2, 'minutes').toDate(),
                    trackDuration: 4 * 60,
                    coverImage: 'https://placehold.co/400?text=Billkin Cover Image',
                    artistImage: 'https://placehold.co/400?text=Billkin',

                })
            }),
        )
    }
}
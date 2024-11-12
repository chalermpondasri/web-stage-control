import { ErrorEnum } from '@libs/common/constants/error.enum'
import { ListResponse } from '@libs/common/models'
import { Broadcast } from '@libs/entities/broadcast.entity'
import { Community } from '@libs/entities/community.entity'
import { RequestContext } from '@libs/providers/request-context.provider'
import { StrapiClient } from '@libs/providers/strapi-client.provider'
import { StickerListResponseDataItem } from '@libs/repositories/strapi-api'
import { BroadcastSseService } from '@libs/sse/broadcast.sse'
import { detectLanguage, Lang } from '@libs/utilities/lang.util'
import { BadRequestException, Logger, MessageEvent, Sse } from '@nestjs/common'
import en from 'assets/en.json'
import BadWordsNext from 'bad-words-next'
import fs from 'fs'
import path from 'path'
import { catchError, from, map, mergeMap, Observable, switchMap, throwError } from 'rxjs'
import thaiCut from 'thai-cut-slim'
import { Repository } from 'typeorm'
import { CreateBroadcastMessageRequest, GetStickerRequest } from './dtos/broadcast.dto'

export class BroadcastService {
    private readonly _logger = new Logger(BroadcastService.name)
    private _thWords: string[] = []
    private _thCurseWords: string[] = []
    private _enCurseWords: string[] = []
    private _enFilter
    private badwords: BadWordsNext

    constructor(
        private readonly _strapiClient: StrapiClient,
        private readonly _broadcastSseService: BroadcastSseService,
        private readonly _broadcastRepository: Repository<Broadcast>,
        private readonly _communityRepository: Repository<Community>,
        private readonly _requestContext: RequestContext,
    ) {
        this._initializeFilters()
        this._loadThaiWords()
        this._loadThaiCurseWords()

        thaiCut.addon(this._thWords)
    }

    private async _initializeFilters() {
        this.badwords = new BadWordsNext({ data: en })
    }

    private _loadThaiWords() {
        this._thWords = fs
            .readFileSync(path.join('assets', 'words_th.txt'), {
                encoding: 'utf-8',
            })
            .split(/[\r\n]+/)
            .filter(function (w) {
                return w.length > 1
            })
    }

    private _loadThaiCurseWords() {
        this._thCurseWords = fs
            .readFileSync(path.join('assets', 'curse_words_th.txt'), {
                encoding: 'utf-8',
            })
            .split(/[\r\n]+/)
            .filter(function (w) {
                return w.length > 1
            })
    }

    public getAllStickers(request: GetStickerRequest): Observable<ListResponse<StickerListResponseDataItem>> {
        return from(
            this._strapiClient.stickerApi.getStickers(
                'createdAt:asc',
                true,
                request.page || 1,
                request.limit || 10,
                undefined,
                undefined,
                undefined,
                'image',
            ),
        ).pipe(
            map((res) => {
                if (!res.data?.data) {
                    return []
                }

                return res.data.data.map((sticker) => {
                    return {
                        id: sticker.id,
                        price: sticker.attributes.price,
                        isFree: sticker.attributes.isFree,
                        image: {
                            url: sticker.attributes.image.data.attributes.url,
                        },
                    }
                })
            }),
            map((data) => {
                const listResponse = new ListResponse<StickerListResponseDataItem>()
                listResponse.data = data
                listResponse.page = request.page || 1
                listResponse.limit = request.limit || 10
                listResponse.total = data.length
                return listResponse
            }),
            catchError((err) => {
                this._logger.error(err)
                throw err
            }),
        )
    }

    public createBroadcastMessage(
        communityId: string,
        body: CreateBroadcastMessageRequest,
    ): Observable<{ status: boolean }> {
        // TODO:: Get profile information
        // TODO:: Transaction
        // TODO:: Blur profile name if body.isShowProfileName = false
        const isContainThai = detectLanguage(body.message) === Lang.Thai

        let filteredMessage = body.message
        let isContainsBadWords = false

        if (isContainThai) {
            filteredMessage = this.censorThaiCurseWords(body.message)
            if (filteredMessage !== body.message) {
                isContainsBadWords = true
            }
        }

        filteredMessage = this.badwords.filter(filteredMessage)
        if (filteredMessage !== body.message) {
            isContainsBadWords = true
        }

        body.message = filteredMessage

        const eventMessage: any = {
            ...body,
            communityId,
        }

        return from(this._communityRepository.findOneBy({ id: communityId })).pipe(
            mergeMap((community) => {
                if (!community) {
                    return throwError(() => new BadRequestException(ErrorEnum.COMMUNITY_NOT_FOUND))
                }

                return this._broadcastRepository.save({
                    message: body.message,
                    stickerId: body.stickerId,
                    community: { id: communityId },
                    createdBy: { id: this._requestContext.identityInfo.userId },
                })
            }),
            map((res) => {
                eventMessage.id = res.id
                return eventMessage
            }),
            switchMap((res) => {
                return from(
                    this._strapiClient.stickerApi.getStickers(
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        'image',
                    ),
                )
            }),
            map((res) => {
                if (res?.data?.data && res.data.data.length > 0) {
                    const sticker = res.data.data[0]
                    eventMessage.sticker = {
                        id: sticker.id,
                        url: sticker.attributes.image.data.attributes.url,
                    }
                } else {
                    eventMessage.sticker = {
                        id: body.stickerId,
                        sticker: null,
                    }
                }
                return eventMessage
            }),
            map((eventMessage) => {
                delete eventMessage.stickerId

                this._broadcastSseService.sendEvent(communityId, {
                    type: 'broadcast',
                    data: eventMessage,
                })

                return eventMessage
            }),
            map((eventMessage) => {
                const objectResponse = {
                    status: true,
                    filteredMessage: eventMessage.message,
                    isShowProfileImage: body.isShowProfileImage,
                    isShowProfileName: body.isShowProfileName,
                    isContainsBadWords,
                    communityId,
                }
                return objectResponse
            }),
            // catchError((err) => {
            //     this._logger.error(err)

            //     if (err instanceof BadRequestException) {
            //         throw err
            //     }

            //     throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR)
            // }),
        )
    }

    @Sse('broadcast')
    sse(communityId: string): Observable<MessageEvent> {
        return from(this._communityRepository.findOneBy({ id: communityId })).pipe(
            map((community) => {
                if (!community) {
                    return throwError(() => new BadRequestException(ErrorEnum.COMMUNITY_NOT_FOUND))
                }
            }),
            switchMap(() => {
                return this._broadcastSseService.getStream(communityId)
            }),
        )
    }

    private censorThaiCurseWords(message: string): string {
        const words = thaiCut.cut(message)
        words.forEach((word) => {
            if (this._thCurseWords.includes(word)) {
                message = message.replace(new RegExp(word, 'g'), '***')
            }
        })

        return message
    }
}

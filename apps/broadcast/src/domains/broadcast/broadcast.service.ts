import { ProviderName } from '@libs/common/constants'
import { ListResponse, ObjectResponse } from '@libs/common/models'
import { Broadcast } from '@libs/entities/broadcast.entity'
import { StrapiClient } from '@libs/providers/strapi-client.provider'
import { StickerListResponseDataItem } from '@libs/repositories/strapi-api'
import { BroadcastSseService } from '@libs/sse/broadcast.sse'
import { detectLanguage, Lang } from '@libs/utilities/lang.util'
import { Body, Inject, Injectable, Logger, MessageEvent, Sse } from '@nestjs/common'
import fs from 'fs'
import path from 'path'
import { catchError, from, map, Observable, switchMap } from 'rxjs'
import thaiCut from 'thai-cut-slim'
import { Repository } from 'typeorm'
import { CreateBroadcastMessageRequest, GetStickerRequest } from './dtos/broadcast.dto'
const FilterApi = Function("return import('bad-words')")()

@Injectable()
export class BroadcastService {
    private readonly _logger = new Logger(BroadcastService.name)
    private _thWords: string[] = []
    private _thCurseWords: string[] = []
    private _enCurseWords: string[] = []
    private _enFilter

    constructor(
        @Inject(ProviderName.STRAPI_CLIENT)
        private readonly _strapiClient: StrapiClient,

        private readonly _broadcastSseService: BroadcastSseService,

        @Inject(ProviderName.BROADCAST_REPOSITORY)
        private readonly _broadcastRepository: Repository<Broadcast>,
    ) {
        this._initializeFilters()
        this._loadThaiWords()
        this._loadThaiCurseWords()

        thaiCut.addon(this._thWords)
    }

    private async _initializeFilters() {
        this._loadEnCurseWords()
        ;(async () => {
            const { Filter } = await FilterApi
            this._enFilter = new Filter({
                placeHolder: '*',
            })
            this._enFilter.addWords(...this._enCurseWords)
        })()
    }

    private _loadThaiWords() {
        this._thWords = fs
            .readFileSync(path.join('dist', 'apps', 'broadcast', 'assets', 'words_th.txt'), {
                encoding: 'utf-8',
            })
            .split(/[\r\n]+/)
            .filter(function (w) {
                return w.length > 1
            })
    }

    private _loadThaiCurseWords() {
        this._thCurseWords = fs
            .readFileSync(path.join('dist', 'apps', 'broadcast', 'assets', 'curse_words_th.txt'), {
                encoding: 'utf-8',
            })
            .split(/[\r\n]+/)
            .filter(function (w) {
                return w.length > 1
            })
    }

    private _loadEnCurseWords() {
        this._enCurseWords = fs
            .readFileSync(path.join('dist', 'apps', 'broadcast', 'assets', 'curse_words_en.txt'), {
                encoding: 'utf-8',
            })
            .split(/[\r\n]+/)
            .filter(function (w) {
                return w.length > 1
            })
    }

    public getAllStickers(request: GetStickerRequest): Observable<ListResponse<StickerListResponseDataItem>> {
        return from(
            this._strapiClient.stickerApi.getStickers('createdAt:asc', true, request.page || 1, request.limit || 10),
        ).pipe(
            map((res) => {
                if (res?.data?.data) {
                    return res.data.data
                }

                return []
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
        @Body() body: CreateBroadcastMessageRequest,
    ): Observable<ObjectResponse<{ status: boolean }>> {
        // TODO:: Get profile information
        // TODO:: Transaction
        const isContainThai = detectLanguage(body.message) === Lang.Thai

        let filteredMessage = body.message
        let isBadWords = false

        if (isContainThai) {
            filteredMessage = this.censorThaiCurseWords(body.message)
            if (filteredMessage !== body.message) {
                isBadWords = true
            }
        }

        filteredMessage = this._enFilter.clean(filteredMessage)
        if (filteredMessage !== body.message) {
            isBadWords = true
        }

        body.message = filteredMessage
        const eventMessage: any = {
            ...body,
        }

        return from(
            this._broadcastRepository.save({
                message: body.message,
                stickerId: body.stickerId,
            }),
        ).pipe(
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
                if (res?.data?.data && res?.data?.data.length > 0) {
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
            map((data) => {
                delete data.stickerId

                this._broadcastSseService.sendEvent({
                    type: 'broadcast',
                    data,
                })

                return data
            }),
            map((data) => {
                const objectResponse = new ObjectResponse<{
                    status: boolean
                    isBadWords: boolean
                    filteredMessage: string
                }>()
                objectResponse.data = {
                    status: true,
                    isBadWords,
                    filteredMessage,
                }
                return objectResponse
            }),
            catchError((err) => {
                this._logger.error(err)
                throw err
            }),
        )
    }

    @Sse('broadcast')
    sse(): Observable<MessageEvent> {
        return this._broadcastSseService.getStream()
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

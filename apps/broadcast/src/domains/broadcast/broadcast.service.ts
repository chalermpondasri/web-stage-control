import { ErrorEnum } from '@libs/common/constants/error.enum'
import { ListResponse } from '@libs/common/models'
import { Broadcast } from '@libs/entities/broadcast.entity'
import { Community } from '@libs/entities/community.entity'
import { Transaction, TransactionType } from '@libs/entities/transaction.entity'
import { User } from '@libs/entities/user.entity'
import { RequestContext } from '@libs/providers/request-context.provider'
import { StrapiClient } from '@libs/providers/strapi-client.provider'
import { StickerListResponseDataItem, StickerResponseDataObject } from '@libs/repositories/strapi-api'
import { BroadcastSseService } from '@libs/sse/broadcast.sse'
import { detectLanguage, Lang, maskName } from '@libs/utilities/lang.util'
import { BadRequestException, Logger, MessageEvent, NotFoundException, Sse } from '@nestjs/common'
import en from 'assets/en.json'
import BadWordsNext from 'bad-words-next'
import dayjs from 'dayjs'
import fs from 'fs'
import padStart from 'lodash/padStart'
import path from 'path'
import qs from 'qs'
import { catchError, defer, from, map, mergeMap, Observable, switchMap, throwError } from 'rxjs'
import thaiCut from 'thai-cut-slim'
import { DataSource, Repository } from 'typeorm'
import { v7 as uuidv7 } from 'uuid'
import { CreateBroadcastMessageRequest, GetStickerRequest } from './dtos/broadcast.dto'
export class BroadcastService {
    private readonly _logger = new Logger(BroadcastService.name)
    private _thWords: string[] = []
    private _thCurseWords: string[] = []
    private badwords: BadWordsNext
    private _fixedCost: number = 10

    constructor(
        private readonly _strapiClient: StrapiClient,
        private readonly _broadcastSseService: BroadcastSseService,
        private readonly _broadcastRepository: Repository<Broadcast>,
        private readonly _communityRepository: Repository<Community>,
        private readonly _requestContext: RequestContext,
        private readonly _userRepository: Repository<User>,
        private readonly _transactionRepository: Repository<Transaction>,
        private readonly dataSource: DataSource,
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
            mergeMap((data) => {
                return from(this._strapiClient.stickerApi.getStickers()).pipe(
                    map((res) => {
                        const total = res.data?.meta?.pagination?.total || 0
                        const listResponse = new ListResponse<StickerListResponseDataItem>()
                        listResponse.data = data
                        listResponse.page = request.page || 1
                        listResponse.limit = request.limit || 10
                        listResponse.total = total
                        return listResponse
                    }),
                )
            }),
            catchError((err) => {
                this._logger.error(err)
                throw err
            }),
        )
    }

    public createBroadcastMessage(communityId: string, body: CreateBroadcastMessageRequest): Observable<any> {
        const isContainThai = detectLanguage(body.message) === Lang.Thai
        this._logger.log(`message: ${body.message}`)
        let filteredMessage = body.message
        let isContainsBadWords = false

        const startTime = Date.now()
        if (isContainThai) {
            filteredMessage = this.censorThaiCurseWords(body.message)
            if (filteredMessage !== body.message) {
                isContainsBadWords = true
            }
        }
        this._logger.log(`Thai censoring took ${Date.now() - startTime}ms`)

        const startTime2 = Date.now()
        filteredMessage = this.badwords.filter(filteredMessage)
        if (filteredMessage !== body.message) {
            isContainsBadWords = true
        }
        this._logger.log(`English censoring took ${Date.now() - startTime2}ms`)

        body.message = filteredMessage

        const eventMessage: any = { ...body, communityId }

        return defer(async () => {
            const queryRunner = this.dataSource.createQueryRunner()
            await queryRunner.connect()
            await queryRunner.startTransaction()

            try {
                const community = await this._validateCommunity(communityId)
                const sticker = await this._validateSticker(body.stickerId)
                const user = await this._validateUser()

                const broadcastCost = this._calculateBroadcastCost(sticker)
                this._validateUserBalance(user, broadcastCost)

                const broadcast = await this._saveBroadcastMessage(
                    queryRunner,
                    communityId,
                    body,
                    user,
                    isContainsBadWords,
                    broadcastCost,
                )
                await this._saveTransaction(queryRunner, broadcast, user, broadcastCost)

                await queryRunner.commitTransaction()

                this._addProfileNameAndImage(eventMessage, user)

                this._sendBroadcastEvent(communityId, eventMessage, sticker)

                return this._buildResponse(eventMessage, isContainsBadWords, communityId)
            } catch (error) {
                this._logger.error(error)

                if (queryRunner.isTransactionActive) {
                    await queryRunner.rollbackTransaction()
                }

                throw error
            } finally {
                await queryRunner.release()
            }
        })
    }

    private async _validateCommunity(communityId: string): Promise<Community> {
        const community = await this._communityRepository.findOneBy({ id: communityId })
        if (!community) {
            throw new BadRequestException(ErrorEnum.COMMUNITY_NOT_FOUND)
        }
        return community
    }

    private async _validateSticker(stickerId: number): Promise<any> {
        if (!stickerId) {
            return null
        }

        try {
            const stickerResponse = await this._strapiClient.stickerApi.getStickersId(stickerId, {
                params: {
                    populate: 'image',
                    filters: qs.stringify({
                        id: stickerId,
                    }),
                },
            })

            const sticker = stickerResponse?.data?.data ? stickerResponse.data.data : null

            if (!sticker || !sticker.attributes.purchasable) {
                throw new BadRequestException(ErrorEnum.STICKER_NOT_PURCHASABLE)
            }
            return sticker
        } catch (error) {
            throw new NotFoundException(ErrorEnum.STICKER_NOT_FOUND)
        }
    }

    private async _validateUser(): Promise<User> {
        const userId = this._requestContext.identityInfo.userId
        if (!userId) {
            throw new BadRequestException(ErrorEnum.JWT_PROFILE_INVALID)
        }
        const user = await this._userRepository.findOneBy({ id: userId })
        if (!user) {
            throw new BadRequestException(ErrorEnum.USER_NOT_FOUND)
        }
        return user
    }

    private _calculateBroadcastCost(sticker: StickerResponseDataObject | null): number {
        const stickerCost = sticker ? (sticker.attributes.isFree ? 0 : sticker.attributes.price) : 0
        return this._fixedCost + (sticker ? stickerCost : 0)
    }

    private _validateUserBalance(user: User, broadcastCost: number): void {
        if (user.remainCoins < broadcastCost) {
            throw new BadRequestException(ErrorEnum.INSUFFICIENT_BALANCE)
        }
    }

    private async _saveBroadcastMessage(
        queryRunner: any,
        communityId: string,
        body: CreateBroadcastMessageRequest,
        user: User,
        isContainsBadWords: boolean,
        broadcastCost: number,
    ): Promise<Broadcast> {
        return await queryRunner.manager.save(
            this._broadcastRepository.create({
                message: body.message,
                stickerId: body.stickerId,
                community: { id: communityId },
                createdBy: { id: user.id },
                isShowProfileImage: body.isShowProfileImage,
                isShowProfileName: body.isShowProfileName,
                isContainsBadWords,
                cost: broadcastCost,
            }),
        )
    }

    private async _saveTransaction(
        queryRunner: any,
        broadcast: Broadcast,
        user: User,
        broadcastCost: number,
    ): Promise<void> {
        const transactionId = this._generateTransactionId(broadcast)
        const transaction = this._transactionRepository.create({
            transactionId,
            type: TransactionType.BROADCAST,
            broadcast: { id: broadcast.id.toString() },
            coinAmount: broadcastCost,
            createdBy: { id: user.id },
        })
        await queryRunner.manager.save(transaction)
        await queryRunner.manager.decrement(User, { id: user.id }, 'remainCoins', transaction.coinAmount)
        await this._broadcastRepository.update(broadcast.id, {
            transaction: { transactionId: transaction.transactionId },
        })
    }

    private _sendBroadcastEvent(
        communityId: string,
        eventMessage: any,
        sticker: StickerResponseDataObject | null,
    ): void {
        delete eventMessage.stickerId
        delete eventMessage.isShowProfileImage
        delete eventMessage.isShowProfileName

        if (!sticker) {
            this._broadcastSseService.sendEvent(communityId, {
                type: 'broadcast',
                data: eventMessage,
            })
            return
        }

        eventMessage.sticker = { id: sticker.id, url: sticker.attributes.image.data.attributes.url }

        this._broadcastSseService.sendEvent(communityId, {
            type: 'broadcast',
            data: eventMessage,
        })
    }

    private _buildResponse(eventMessage: any, isContainsBadWords: boolean, communityId: string): any {
        return {
            status: true,
            filteredMessage: eventMessage.message,
            isContainsBadWords,
            profileName: eventMessage.profileName,
            profileImage: eventMessage.profileImage,
            communityId,
        }
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

    private _generateTransactionId(broadcast: Broadcast): string {
        const ts = dayjs()
        return `${ts.format('YYYYMMDDHHmmssSSS')}-VO${padStart(String(broadcast.id), 12, '0')}${uuidv7()}`
    }

    private _addProfileNameAndImage(eventMessage: any, user: User): any {
        const userId = this._requestContext.identityInfo.userId
        if (!userId) {
            return eventMessage
        }

        eventMessage.profileName = eventMessage.isShowProfileName ? user.name : maskName(user.name)
        eventMessage.profileImage = eventMessage.isShowProfileImage ? user.picture : null

        return eventMessage
    }
}

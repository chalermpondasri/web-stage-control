import {
    BackdropListResponse,
    BackdropListResponseDataItem,
} from '@libs/repositories/strapi-api'
import {
    catchError,
    concatMap,
    from,
    map,
    Observable,
    of,
} from 'rxjs'
import { IBackdropService } from './interfaces/service.interface'
import { StrapiClient } from '@libs/providers/strapi-client.provider'
import { Logger } from '@nestjs/common'
import { rethrow } from '@nestjs/core/helpers/rethrow'
import {
    BackdropDto,
    CommunityIdDto,
    MediaDto,
} from '@libs/common/models/media/backdrop.dto'
import { plainToInstance } from 'class-transformer'

export class BackdropService implements IBackdropService {
    private readonly _logger: Logger = new Logger(BackdropService.name)

    public constructor(
        private readonly _strapiClient: StrapiClient,
    ) {
    }

    public getByCommunityId(communityId: string): Observable<BackdropDto[]> {

        let filters = null
        if (communityId) {
            filters = {
                communities: {
                    communityId: {
                        '$contains': communityId,
                    },
                },
            }
        }
        const requestObs$ = (accumulator: BackdropListResponseDataItem[] = [], page = 1): Observable<BackdropListResponseDataItem[]> => {
            return from(this._strapiClient.backdropApi.getBackdrops(
                null,
                true,
                page,
                null,
                null,
                null,
                null,
                '*',
                null,
                null,
                {
                    params: filters ? { filters } : null,
                },
            )).pipe(
                map(response => <BackdropListResponse>response.data),
                concatMap(({ meta, data }) => {
                    if (meta.pagination.page < meta.pagination.pageCount) {
                        return requestObs$(data, meta.pagination.page + 1)
                    }

                    return of(accumulator.concat(data))
                }),
            )
        }

        return requestObs$().pipe(
            map(result => {
                return result.map(({ id, attributes }) => {
                    const schema: BackdropDto = {
                        id,
                        name: attributes.name,
                        type: attributes.type,
                        duration: attributes.duration,
                        startTime: attributes.startTime,
                        endTime: attributes.endTime,
                        createdAt: attributes.createdAt,
                        updatedAt: attributes.updatedAt,
                        publishedAt: attributes.publishedAt,
                        communities: attributes
                            .communities.map(({
                                                  id,
                                                  communityId,
                                              }) => plainToInstance(CommunityIdDto, {
                                id,
                                communityId,
                            })),
                        media: plainToInstance(MediaDto, {
                            id: attributes.media.data.id,
                            ...attributes.media.data.attributes,
                        }),
                    }
                    return plainToInstance(BackdropDto, schema)
                })
            }),
            catchError((error) => {
                this._logger.error(error)
                rethrow(error)
            }),
        )
    }
}
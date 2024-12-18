import { StrapiClient } from '@libs/providers/strapi-client.provider'
import { Inject } from '@nestjs/common'
import { ProviderName } from '@libs/common/constants'
import {
    concatMap,
    from,
    map,
    Observable,
    of,
} from 'rxjs'
import {
    AnnouncementListResponse,
    AnnouncementListResponseDataItem,
} from '@libs/repositories/strapi-api'
import dayjs from 'dayjs'
import { plainToInstance } from 'class-transformer'
import { AnnouncementDto } from '@libs/common/models/announcement/announcement.dto'

export class AnnouncementService {

    public constructor(
        @Inject(ProviderName.STRAPI_CLIENT)
        private readonly _strapiClient: StrapiClient,
    ) {
    }

    public getCommunityAnnouncements(communityId?: string) {
        const filters = {

            '$and': [

                {
                    communities: !!communityId ? {
                        communityId: communityId
                    } : undefined,
                },
                {
                    '$or': [
                        {
                            startDate: {
                                '$lte': dayjs().format('YYYY-MM-DD'),
                            },
                            endDate: {
                                '$gte': dayjs().format('YYYY-MM-DD'),
                            },
                        },
                        {
                            startDate: {
                                '$lte': dayjs().format('YYYY-MM-DD'),
                            },
                            endDate: { '$null': true },
                        },
                    ],
                },
            ],
        }
        const requestObs$ = (accumulator: AnnouncementListResponseDataItem[] = [], page = 1): Observable<AnnouncementListResponseDataItem[]> => {
            return from(this._strapiClient.announcementApi.getAnnouncements(
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
                    params: { filters },
                },
            )).pipe(
                map(response => {
                    return <AnnouncementListResponse>response.data
                }),
                concatMap(({ meta, data }) => {
                    if (meta.pagination.page < meta.pagination.pageCount) {
                        return requestObs$(data, meta.pagination.page + 1)
                    }

                    return of(accumulator.concat(data))
                }),
            )
        }

        return requestObs$().pipe(
            map(data => {
                return data.map(record => {
                    return plainToInstance(AnnouncementDto, {
                        id: record.id,
                        ...record.attributes,
                    })
                })
            }),
        )

    }
}
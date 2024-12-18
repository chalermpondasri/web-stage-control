import {
    catchError,
    concatMap,
    from,
    map,
    Observable,
    of,
} from 'rxjs'
import {
    IAdFilter,
    IAdsService,
} from './interfaces/service.interface'
import { StrapiClient } from '@libs/providers/strapi-client.provider'
import { rethrow } from '@nestjs/core/helpers/rethrow'
import {
    AdvertisementListResponse,
    AdvertisementListResponseDataItem,
} from '@libs/repositories/strapi-api'
import { AdvertisementDto } from '@libs/common/models/media/advertisement.dto'
import { plainToInstance } from 'class-transformer'

export class AdsService implements IAdsService {
    public constructor(
        private readonly _strapiClient: StrapiClient,
    ) {
    }

    public getAdsDetail(adsId: number): Observable<any> {
        return from(this._strapiClient.adsApi.getAdvertisementsId(adsId)).pipe(
            map(response => response.data),
            catchError(error => {
                console.error(error)
                rethrow(error)
            }),
        )
    }

    public getAds(adsFilter?:IAdFilter): Observable<AdvertisementDto[]> {
        let filters = null
        if(adsFilter) {
            filters = {
                communities: {
                    communityId: {
                        '$contains': adsFilter.communityId,
                    }
                }
            }
        }
        const requestObs$ = (accumulator:  AdvertisementListResponseDataItem[] = [], page = 1): Observable<AdvertisementListResponseDataItem[]> => {
            return from(this._strapiClient.adsApi.getAdvertisements(
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
                    params: { filters }
                }

            )).pipe(
                map(response => {
                    return <AdvertisementListResponse> response.data
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
                    return plainToInstance(AdvertisementDto, {
                        id: record.id,
                        ...record.attributes,
                        media: record?.attributes?.media?.data?.attributes
                    })
                })
            })
        )

    }

}
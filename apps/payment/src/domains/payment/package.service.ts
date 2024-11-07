import { PackageDto } from '@libs/common/models/payment/pakage.dto';
import {
    catchError,
    from,
    map,
    Observable,
} from 'rxjs'
import { IPackageService } from './interfaces/service.interface'
import { StrapiClient } from '@libs/providers/strapi-client.provider'
import { plainToInstance } from 'class-transformer'
import { rethrow } from '@nestjs/core/helpers/rethrow'

export class PackageService implements IPackageService {
    public constructor(
        private readonly _strapiClient: StrapiClient,
    ) {
    }
    public getPackages(): Observable<PackageDto[]> {
        return from(this._strapiClient.coinPackage.getCoinPackages('price')).pipe(
            map(result => {
                const {data} = result
                return data.data.map(d => {
                    return plainToInstance(PackageDto, {
                        id: d.id,
                        totalCoinGain: d.attributes.coins,
                        bonus: d.attributes.bonus,
                        price: d.attributes.price,
                    })
                })
            }),
            catchError(err => {
                console.error(err)
                return rethrow(err)
            })
        )
    }

}
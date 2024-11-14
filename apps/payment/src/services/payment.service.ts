import { Payment } from '@libs/entities/payment.entity'
import {
    BadRequestException,
    Logger,
    LoggerService,
} from '@nestjs/common'
import dayjs from 'dayjs'
import {
    from,
    map,
    mergeMap,
    Observable,
    of,
    throwError,
} from 'rxjs'
import { Repository } from 'typeorm'
import { IPaymentService } from './interfaces/service.interface'
import { RequestContext } from '@libs/providers/request-context.provider'
import { CheckoutPackageResponse } from './dto/checkout-package.response'
import _ from 'lodash'
import { StrapiClient } from '@libs/providers/strapi-client.provider'
import { PaymentStatus } from '@libs/common/constants/payment-status.enum'
import { plainToInstance } from 'class-transformer'
import { CheckoutPackageRequest } from './dto/checkout-package.request'
import { ErrorEnum } from '@libs/common/constants/error.enum'

export class PaymentService implements IPaymentService {
    private readonly _logger: LoggerService

    public constructor(
        private readonly _paymentRepository: Repository<Payment>,
        private readonly _requestContext: RequestContext,
        private readonly _strapiClient: StrapiClient,
    ) {
        this._logger = new Logger(PaymentService.name)
    }

    public getCheckoutById(id: string): Observable<CheckoutPackageResponse> {
        const userId = this._requestContext.identityInfo.userId
        return from(this._paymentRepository.findOneBy({
            userId,
            transactionId: id,
            paymentStatus: PaymentStatus.PENDING,
        })).pipe(
            mergeMap(result => {
                if(!result) {
                    return throwError(() => new BadRequestException(ErrorEnum.CHECKOUT_INVALID_PACKAGE))
                }

                return of(result)
            }),
            map(data => {
                return plainToInstance(CheckoutPackageResponse,
                    {
                        transactionId: data.transactionId,
                        expireAt: data.expiredAt,
                        packageId: data.coinPackageId,
                        total: data.total,
                        coinGain: data.coinGain,
                        coinBonus: data.coinBonus,
                        qrData: 'Lorem-Ipsum-Dolor-Sit-Amet',
                        paymentStatus: data.paymentStatus,
                    })
            })
        )

    }

    public checkoutPackage(body: CheckoutPackageRequest): Observable<CheckoutPackageResponse> {

        const {packageId} = body

        const ts = dayjs()
        const expiredAt = ts.add(15, 'minutes')
        const idSum = this._requestContext.identityInfo.userId
            .replaceAll('-', '').split('')
            .reduce((acc, v) => acc + parseInt(v, 16), 0)
        const transactionId = `${ts.format('YYYYMMDDHHmmssSSS')}-TA${_.padStart(String(packageId), 2, '0')}${(Number(ts.format('SSS')) + idSum) % 1000}`


        return from(this._strapiClient.coinPackage.getCoinPackagesId(packageId)).pipe(
            mergeMap(({data}) => {

                const {price, coins, bonus, purchasable} = data.data.attributes

                if(!purchasable ||
                    price !== body.price ||
                    coins !== body.coinGain ||
                    bonus !== body.coinBonus
                ) {
                    return throwError(() => new BadRequestException(ErrorEnum.CHECKOUT_INVALID_PACKAGE))
                }

                return of(data)
            }),
            mergeMap(data => {

                const entity = this._paymentRepository.create({
                    transactionId,
                    userId: this._requestContext.identityInfo.userId,
                    total: data.data.attributes.price,
                    coinPackageId: data.data.id,
                    coinPackagePrice: data.data.attributes.price,
                    coinGain: data.data.attributes.coins,
                    coinBonus: data.data.attributes.bonus,
                    expiredAt: expiredAt.toDate(),
                    paymentStatus: PaymentStatus.PENDING,
                })

                return from(this._paymentRepository.save(entity))
            }),
            map(data => {
                return plainToInstance(CheckoutPackageResponse,
                    {
                        transactionId: data.transactionId,
                        expireAt: data.expiredAt,
                        packageId: data.coinPackageId,
                        total: data.total,
                        coinGain: data.coinGain,
                        coinBonus: data.coinBonus,
                        qrData: 'Lorem-Ipsum-Dolor-Sit-Amet',
                        paymentStatus: data.paymentStatus,
                    })
            }),
        )

    }


}

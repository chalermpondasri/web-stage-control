import {
    ListResponse,
    Pagination,
} from '@libs/common/models'
import { Payment } from '@libs/entities/payment.entity'
import { IEncryptionService } from '@libs/providers/encryption.provider'
import {
    BadRequestException,
    Logger,
    LoggerService,
} from '@nestjs/common'
import dayjs from 'dayjs'
import {
    catchError,
    EMPTY,
    from,
    iif,
    map,
    mergeMap,
    Observable,
    of,
    tap,
    throwError,
    throwIfEmpty,
} from 'rxjs'
import { Repository } from 'typeorm'
import { v4 } from 'uuid'
import { IPaymentTransaction } from './dto/payment-token.model'
import { PaymentTransactionDto } from './dto/payment-transaction.dto'
import { PaymentDomainErrorBuilder } from './errors/error-builder'
import { IPaymentService } from './interfaces/service.interface'
import { RequestContext } from '@libs/providers/request-context.provider'
import { PaymentStatus } from '@libs/common/constants/payment-status.enum'
import { CheckoutPackageResponse } from './dto/checkout-package.response'

export class PaymentService implements IPaymentService {
    private readonly _errorBuilder: PaymentDomainErrorBuilder
    private readonly _logger: LoggerService

    public constructor(
        private readonly _paymentRepository: Repository<Payment>,
        private readonly _requestContext: RequestContext,
        private readonly _encryptionService: IEncryptionService,
    ) {
        this._errorBuilder = new PaymentDomainErrorBuilder()
        this._logger = new Logger(PaymentService.name)
    }

    public checkoutPackage(transactionToken: string, packageId: number): Observable<CheckoutPackageResponse> {
        throw new Error('Method not implemented.')
    }

    public getPaymentHistory(pagination: Pagination): Observable<ListResponse<PaymentTransactionDto>> {
        throw new Error('Method not implemented.')
    }

    public createPaymentTransaction(): Observable<{ transactionToken: string }> {
        const payload: IPaymentTransaction = {
            u: this._requestContext.identityInfo.userId,
            e: dayjs().add(15, 'minutes').toISOString(),
            t: v4().toString(),
        }

        const { encrypted } = this._encryptionService.encrypt(JSON.stringify(payload))
        const transactionToken = encrypted.toString('base64url')

        const payment = this._paymentRepository.create({
            transactionId: payload.t,
            userId: this._requestContext.identityInfo.userId,
            paymentStatus: PaymentStatus.INITIAL,
        })

        return from(this._paymentRepository.save(payment)).pipe(
            tap((v) => this._logger.log({ ...v })),
            map(() => ({ transactionToken })),
        )
    }

    private _validateToken(stringToken: string): Observable<IPaymentTransaction> {
        return of(Buffer.from(stringToken, 'base64url')).pipe(
            map((encrypted) => this._encryptionService.decrypt({ encrypted })),
            catchError(() => EMPTY),
            throwIfEmpty(() => new BadRequestException('invalid token')),
            map((jsonString) => JSON.parse(jsonString)),
            mergeMap((data: IPaymentTransaction) => {
                return iif(
                    () => dayjs(data.e).isBefore(new Date()),
                    throwError(() => new BadRequestException('token expired')),
                    of(data),
                )
            }),
        )
    }
}

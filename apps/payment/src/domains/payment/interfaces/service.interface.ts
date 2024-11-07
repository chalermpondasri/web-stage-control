import {
    ListResponse,
    Pagination,
} from '@libs/common/models'
import { Observable } from 'rxjs'
import { CheckoutPackageResponse } from '../dto/checkout-package.response'
import { PaymentTransactionDto } from '../dto/payment-transaction.dto'
import { PackageDto } from '@libs/common/models/payment/pakage.dto'

export interface IPaymentService {
    createPaymentTransaction(): Observable<{ transactionToken: string }>
    checkoutPackage(transactionToken: string, packageId: number): Observable<CheckoutPackageResponse>
    getPaymentHistory(pagination: Pagination): Observable<ListResponse<PaymentTransactionDto>>
}

export interface IPackageService {
    getPackages(): Observable<PackageDto[]>
}
import { Observable } from 'rxjs'
import { CheckoutPackageResponse } from '../dto/checkout-package.response'
import { PackageDto } from '@libs/common/models/payment/pakage.dto'
import { CheckoutPackageRequest } from '../dto/checkout-package.request'
import {
    ListResponse,
    Pagination,
} from '@libs/common/models'
import { PaymentHistoryDto } from '../dto/payment-history.dto'

export interface IPaymentService {
    checkoutPackage(request: CheckoutPackageRequest): Observable<CheckoutPackageResponse>

    getCheckoutById(id: string): Observable<CheckoutPackageResponse>

    getPaymentHistories(pagination: Pagination): Observable<ListResponse<PaymentHistoryDto>>
}

export interface IPackageService {
    getPackages(): Observable<PackageDto[]>
}
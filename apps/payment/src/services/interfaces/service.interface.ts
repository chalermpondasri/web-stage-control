import { Observable } from 'rxjs'
import { CheckoutPackageResponse } from '../dto/checkout-package.response'
import { PackageDto } from '@libs/common/models/payment/pakage.dto'
import { CheckoutPackageRequest } from '../dto/checkout-package.request'

export interface IPaymentService {
    checkoutPackage(request: CheckoutPackageRequest): Observable<CheckoutPackageResponse>

    getCheckoutById(id: string): Observable<CheckoutPackageResponse>
}

export interface IPackageService {
    getPackages(): Observable<PackageDto[]>
}
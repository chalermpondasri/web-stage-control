import { Observable } from 'rxjs'
import { CheckoutPackageResponse } from '../dto/checkout-package.response'
import { PackageDto } from '@libs/common/models/payment/pakage.dto'

export interface IPaymentService {
    checkoutPackage( packageId: number): Observable<CheckoutPackageResponse>
}

export interface IPackageService {
    getPackages(): Observable<PackageDto[]>
}
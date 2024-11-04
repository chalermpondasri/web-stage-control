import { Pagination } from '@libs/common/models'
import { Body, Controller, Get, Inject, Patch, Post, Query, UseGuards } from '@nestjs/common'

import { CheckoutPackageRequest } from '../domains/payment/dto/checkout-package.request'
import { IPaymentService } from '../domains/payment/interfaces/service.interface'
import { ProviderName } from '@libs/common/constants/providerName'
import { JwtTokenGuard } from '@libs/providers/jwt-token-guard.service'

@Controller('/payments')
export class PaymentController {
    public constructor(
        @Inject(ProviderName.PAYMENT_SERVICE)
        private readonly _paymentService: IPaymentService,
    ) {}

    @UseGuards(JwtTokenGuard)
    @Get('/')
    public getPaymentHistory(@Query() pagination: Pagination) {
        return this._paymentService.getPaymentHistory(pagination)
    }

    @UseGuards(JwtTokenGuard)
    @Post('/transaction')
    public createPaymentTransaction() {
        return this._paymentService.createPaymentTransaction()
    }

    @UseGuards

    @Patch('/transaction')
    public checkoutPackage(@Body() body: CheckoutPackageRequest) {
        return this._paymentService.checkoutPackage(body.transactionToken, body.packageId)
    }
}

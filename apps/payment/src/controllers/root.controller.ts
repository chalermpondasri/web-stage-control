import {
    Body,
    Controller,
    Inject,
    Post,
    UseGuards,
} from '@nestjs/common'
import { ProviderName } from '@libs/common/constants'
import { IPaymentService } from '../services/interfaces/service.interface'
import { CheckoutPackageRequest } from '../services/dto/checkout-package.request'
import { GenericUserGuard } from '@libs/guards/generic-user.guard'
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiResponse,
} from '@nestjs/swagger'
import { CheckoutPackageResponse } from '../services/dto/checkout-package.response'

@Controller('/')
export class RootController {

    public constructor(
        @Inject(ProviderName.PAYMENT_SERVICE)
        private readonly _paymentService: IPaymentService
    ) {
    }

    @ApiBearerAuth()
    @ApiOperation({description: 'checkout selected package'})
    @ApiBody({
        type: CheckoutPackageRequest
    })
    @ApiResponse({
        type: CheckoutPackageResponse
    })
    @UseGuards(GenericUserGuard)
    @Post('/checkout')
    public checkoutPackage(
        @Body() body: CheckoutPackageRequest,
    ) {
        return this._paymentService.checkoutPackage(body)
    }

}
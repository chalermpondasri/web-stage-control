import {
    Body,
    Controller,
    Get,
    HttpCode,
    Inject,
    Param,
    Post,
    Query,
    Sse,
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
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import { CheckoutPackageResponse } from '../services/dto/checkout-package.response'
import { Pagination } from '@libs/common/models'
import { PaymentHistoryDto } from '../services/dto/payment-history.dto'
import { ApiOkListResponse } from '@libs/utilities/decorators/api-ok-list-response.decorator'
import { PaymentPayload } from '../services/dto/qr30-confirm.request'
import { EventSubjectFactory } from '@libs/providers/event-subject.provider'
@Controller('/')
export class RootController {

    public constructor(
        @Inject(ProviderName.PAYMENT_SERVICE)
        private readonly _paymentService: IPaymentService,
        @Inject(ProviderName.SSE_PAYMENT_SUBJECT)
        private readonly _eventSubjectFactory: EventSubjectFactory
    ) {
    }

    @ApiBearerAuth()
    @ApiOperation({ description: 'checkout selected package' })
    @ApiBody({
        type: CheckoutPackageRequest,
    })
    @ApiResponse({
        type: CheckoutPackageResponse,
    })
    @UseGuards(GenericUserGuard)
    @Post('/checkout')
    public checkoutPackage(
        @Body() body: CheckoutPackageRequest,
    ) {
        return this._paymentService.checkoutPackage(body)
    }

    @ApiOperation({ description: 'get checkout  detail by id' })
    @ApiParam({
        name: 'id',
    })
    @ApiResponse({
        type: CheckoutPackageResponse,
    })
    @Get('/checkout/:id')
    public getCheckoutById(@Param('id') id: string) {
        return this._paymentService.getCheckoutById(id)
    }

    @ApiTags(...['sse'])

    @Sse('/checkout/:id/sse')
    @ApiOperation({ description: 'SSE endpoint to subscribe to realtime payment status' })
    @ApiParam({ name: 'id', description: 'checkout id to subscribe to', type: 'string' })
    @ApiResponse({
        example: {
            "transactionId": "20250122045154682-TA01967",
            "status": "PAID",
            "total": 100
        }
    })
    public subscribeCheckoutEventSubject(
        @Param('id') id: string,
    ) {
        return this._eventSubjectFactory.getSubject(id)
    }

    @ApiBearerAuth()
    @ApiOperation({ description: 'get payment history, see PaymentHistoryDto for more information' })
    @ApiOkListResponse(PaymentHistoryDto)
    @UseGuards(GenericUserGuard)
    @Get()
    public getPaymentHistory(
        @Query() pagination: Pagination,
    ) {
        return this._paymentService.getPaymentHistories(pagination)
    }

    @HttpCode(200)
    @Post(`/qr-confirmation/${process.env.OPEN_BANKING_UNIQUE_URL}`)
    public qrPaymentConfirmation(
        @Body() body: PaymentPayload
    ) {

        return this._paymentService.qr30PaymentConfirm(body)

    }

}
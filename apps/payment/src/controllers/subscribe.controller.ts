import { ProviderName } from '@libs/common/constants'
import { Pagination } from '@libs/common/models'
import { Body, Controller, Get, Inject, Post, Query, UseGuards } from '@nestjs/common'
import { VerifiedUserGuard } from '../../../main/src/domains/authentication/verified-user.guard'
import { RentRequest } from '../domains/payment/dto/rent.request'
import { IPaymentService } from '../domains/payment/interfaces/service.interface'

@Controller('/subscriptions')
@UseGuards(VerifiedUserGuard)
export class SubscribeController {
    public constructor(
        @Inject(ProviderName.PAYMENT_SERVICE)
        private readonly _paymentService: IPaymentService,
    ) {}

    @Post('/content')
    public rentEpisode(@Body() rentRequest: RentRequest) {
        return this._paymentService.rentContent(rentRequest)
    }

    @Get('/contents')
    public getSubscribedContents() {
        return this._paymentService.getSubscribedContents()
    }
    @Get('/latest')
    public getLatestSubscriptions(@Query() pagination: Pagination) {
        return this._paymentService.getLatestSubscriptions(pagination)
    }
}

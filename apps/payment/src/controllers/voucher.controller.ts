import { ProviderName } from '@libs/common/constants'
import { GenericUserGuard } from '@libs/guards/generic-user.guard'
import { Body, Controller, Get, Inject, Post, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiExcludeEndpoint, ApiOperation } from '@nestjs/swagger'
import { ApplyVoucherRequest, GetVoucherRequest } from '../services/dto/voucher-request.request'
import { VoucherService } from '../services/voucher.service'

@Controller('/voucher')
export class VoucherController {
    public constructor(
        @Inject(ProviderName.VOUCHER_SERVICE)
        private readonly _voucherService: VoucherService,
    ) {}

    @ApiOperation({ description: 'Get all vouchers by campaign id (for test purpose only)' })
    @ApiExcludeEndpoint(process.env.NODE_ENV === 'production')
    @Get('/')
    public getAllVouchers(@Query() query: GetVoucherRequest) {
        return this._voucherService.getAllVouchers(query)
    }

    @UseGuards(GenericUserGuard)
    @ApiBearerAuth()
    @ApiOperation({ description: 'Apply voucher' })
    @Post('/apply')
    public applyVoucher(@Body() body: ApplyVoucherRequest) {
        return this._voucherService.applyVoucher(body.code)
    }
}

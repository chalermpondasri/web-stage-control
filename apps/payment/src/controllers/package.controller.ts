import {
    Controller,
    Get,
    Inject,
} from '@nestjs/common'
import { ProviderName } from '@libs/common/constants'
import { IPackageService } from '../services/interfaces/service.interface'
import {
    ApiOperation,
    ApiResponse,
} from '@nestjs/swagger'
import { PackageDto } from '@libs/common/models/payment/pakage.dto'

@Controller('/packages')
export class PackageController {

    public constructor(
        @Inject(ProviderName.PACKAGE_SERVICE)
        private readonly _packageService: IPackageService,
    ) {
    }

    @ApiOperation({description:'get available coin package with bonus coins'})
    @ApiResponse({type: [PackageDto]})
    @Get('/')
    public getCoinPackages() {
        return this._packageService.getPackages()
    }
}
import {
    Controller,
    Get,
    Inject,
    UseGuards,
} from '@nestjs/common'
import { ProviderName } from '@libs/common/constants'
import { IUserService } from '../services/interfaces/user-service.interface'
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import { GenericUserGuard } from '@libs/guards/generic-user.guard'
import { UserProfileDto } from '@libs/common/models/user/user-profile.dto'

@ApiTags(...['user', 'me'])
@ApiBearerAuth()
@Controller('/users/me')
@UseGuards(GenericUserGuard)
export  class MeController {
    public constructor(
        @Inject(ProviderName.USER_SERVICE)
        private readonly _userService: IUserService,
    ) {
    }

    @ApiOperation({
        description: 'Get user profile'
    })
    @ApiResponse({
        type: UserProfileDto,
    })
    @Get('/')
    public getUserProfile() {
        return this._userService.getUserProfile()

    }
}
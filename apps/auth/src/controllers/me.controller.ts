import {
    Body,
    Controller,
    Get,
    Inject,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common'
import { ProviderName } from '@libs/common/constants'
import {
    INotificationService,
    IUserService,
} from '../services/interfaces/user-service.interface'
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import { GenericUserGuard } from '@libs/guards/generic-user.guard'
import { UserProfileDto } from '@libs/common/models/user/user-profile.dto'
import { UpdateProfileRequest } from '@libs/common/models/user/update-profile.request'
import { SuggestionRequest } from '@libs/common/models/user/suggestion.request'
import { UpdateProfileDarkModeRequest } from '@libs/common/models/user/update-profile-dark-mode.request'

@ApiTags(...['user', 'me'])
@Controller('/users/me')
export class MeController {
    public constructor(
        @Inject(ProviderName.USER_SERVICE)
        private readonly _userService: IUserService,
        @Inject(ProviderName.NOTIFICATION_SERVICE)
        private readonly _notificationService: INotificationService,
    ) {
    }

    @ApiBearerAuth()
    @ApiOperation({
        description: 'Get user profile',
    })
    @ApiResponse({
        type: UserProfileDto,
    })
    @Get('/')
    @UseGuards(GenericUserGuard)
    public getUserProfile() {
        return this._userService.getUserProfile()

    }

    @ApiBearerAuth()
    @ApiResponse({
        type: UserProfileDto,
    })
    @Patch('/')
    @UseGuards(GenericUserGuard)
    public updateUser(
        @Body() request: UpdateProfileRequest,
    ) {
        return this._userService.updateUserProfile(request)
    }

    @ApiOperation({ description: 'update user them dark mode' })
    @ApiBearerAuth()
    @Patch('/dark-mode')
    @UseGuards(GenericUserGuard)
    public updateDarkMode(
        @Body() request: UpdateProfileDarkModeRequest
    ) {
        return this._userService.updateDarkMode(request)
    }

    @ApiOperation({ description: 'send a suggestion' })
    @ApiBody({ type: SuggestionRequest })
    @ApiBearerAuth()
    @UseGuards(GenericUserGuard)
    @Post('/suggestions')
    public doSuggestions(
        @Body() suggestions: SuggestionRequest,
    ) {
        return this._notificationService.sendSuggestion(suggestions)

    }
}
import {
    Body,
    Controller,
    Get,
    Inject,
    Param,
    Patch,
    StreamableFile,
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
import { createReadStream } from 'fs'
import path from 'path'
import { UpdateProfileRequest } from '@libs/common/models/user/update-profile.request'

@ApiTags(...['user', 'me'])
@Controller('/users/me')
export class MeController {
    public constructor(
        @Inject(ProviderName.USER_SERVICE)
        private readonly _userService: IUserService,
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

    @ApiTags(...['user', 'me', 'resource'])
    @Get('/image/static/:filename')
    public getUserImage(
        @Param('filename') filename: string,
    ) {
        return new StreamableFile(
            createReadStream(path.resolve(`./static/${filename}`)),
            { type: 'image/jpg' },
        )
    }
}
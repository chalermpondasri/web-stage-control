import {
    Body,
    Controller,
    Get,
    Inject,
    Param,
    Post,
    StreamableFile,
    UseGuards,
} from '@nestjs/common'
import { ProviderName } from '@libs/common/constants/providerName'
import { IAuthenticationService } from '../services/interfaces/authentication-service.interface'
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import { LineLoginRequest } from '@libs/common/models/user/line-login.request'
import { UpdateConsentRequest } from '@libs/common/models/user/update-consent.request'
import { IUserService } from '../services/interfaces/user-service.interface'
import { TokenDto } from '@libs/common/models/common/token.dto'
import { createReadStream } from 'fs'
import path from 'path'
import { RequestContext } from '@libs/providers/request-context.provider'
import { UnacceptedConsentGuard } from '@libs/guards/unaccepted-consent.guard'

@ApiTags('user')
@Controller('/users')
export class UserController {
    public constructor(
        @Inject(ProviderName.AUTHENTICATION_SERVICE)
        private readonly _authenticationService: IAuthenticationService,
        @Inject(ProviderName.USER_SERVICE)
        private readonly _userService: IUserService,
        @Inject(ProviderName.REQUEST_CONTEXT)
        private readonly _requestContext: RequestContext,
    ) {
    }

    @ApiOperation({
        description: 'user login using LINE integration',
    })
    @ApiBody({
        type: LineLoginRequest,
        description: 'user login using LINE integration',
        required: true,
    })
    @ApiResponse({
        description: 'return access and refresh token',
        type: TokenDto,
        example: {
            accessToken: 'eyJhbGciOiJSUzI1Ni..,.',
            refreshToken: 'eyJhbGciOiJSUzI1Ni...',
        },
    })
    @Post('/login')
    public userLoginWithLINE(
        @Body() body: LineLoginRequest,
    ) {
        return this._authenticationService.doLineLogin(body.authorizationCode)
    }

    @ApiOperation({
        description: 'update consent usage agreement',
    })
    @ApiBody({
        type: UpdateConsentRequest,
        required: true,
    })
    @ApiResponse({
        type: TokenDto,
    })

    @ApiBearerAuth(UpdateConsentRequest.name)
    @Post('/consent')
    @UseGuards(UnacceptedConsentGuard)
    public updateConsent(
        @Body() body: UpdateConsentRequest,
    ) {
        return this._userService.updateUserConsent(body)
    }

    @ApiTags(...['user', 'resource'])
    @Get('/me/image/static/:filename')
    public getUserImage(
        @Param('filename') filename: string,
    ) {
        return new StreamableFile(
            createReadStream(path.resolve(`./static/${filename}`)),
            { type: 'image/jpg' },
        )
    }
}
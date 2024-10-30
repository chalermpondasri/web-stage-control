import {
    Body,
    Controller,
    Inject,
    Post,
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
import { RequestContext } from '@libs/providers/request-context.provider'
import { UnacceptedConsentGuard } from '@libs/guards/unaccepted-consent.guard'
import { RefreshTokenRequest } from '@libs/common/models/user/refresh-token.request'

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

    @ApiTags(...['authentication'])
    @Post('/login')
    public userLoginWithLINE(
        @Body() body: LineLoginRequest,
    ) {
        return this._authenticationService.doLineLogin(body.authorizationCode)
    }

    @ApiTags(...['authentication'])
    @ApiOperation({
        description: 'generate new user tokens from refresh token',
    })
    @ApiBody({
        type: RefreshTokenRequest,
    })
    @ApiResponse({
        description: 'return access and refresh token',
        type: TokenDto,
        example: {
            accessToken: 'eyJhbGciOiJSUzI1Ni..,.',
            refreshToken: 'eyJhbGciOiJSUzI1Ni...',
        },
    })
    @Post('/refreshToken')
    public refreshToken(
        @Body() request: RefreshTokenRequest,
    ){
        return this._authenticationService.refreshToken(request)
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
}
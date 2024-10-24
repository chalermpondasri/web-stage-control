import {
    Body,
    Controller,
    Inject,
    Post,
} from '@nestjs/common'
import { ProviderName } from '@libs/common/constants/providerName'
import { IAuthenticationService } from '../services/interfaces/authentication-service.interface'
import {
    ApiBody,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import { LineLoginRequest } from '@libs/common/models/user/line-login.request'
import { LoginRequest } from '@libs/common/models/user/login.request'
import { UpdateConsentRequest } from '@libs/common/models/user/update-consent.request'
import { IUserService } from '../services/interfaces/user-service.interface'
import { TokenDto } from '@libs/common/models/common/token.dto'

@ApiTags('user')
@Controller('/users')
export class UserController {
    public constructor(
        @Inject(ProviderName.AUTHENTICATION_SERVICE)
        private readonly _authenticationService: IAuthenticationService,
        @Inject(ProviderName.USER_SERVICE)
        private readonly _userService: IUserService,
    ) {
    }

    @ApiOperation({
        description: 'user login using LINE integration'
    })
    @ApiBody({
        type: LoginRequest,
        description: 'user login using LINE integration',
        required: true,
    })
    @ApiResponse({
        description: 'return access and refresh token',
        type: TokenDto,
        example: {
            accessToken: 'eyJhbGciOiJSUzI1Ni..,.',
            refreshToken: 'eyJhbGciOiJSUzI1Ni...'
        }
    })
    @Post('/login')
    public userLoginWithLINE(
        @Body() body: LineLoginRequest,
    ) {
        return this._authenticationService.doLineLogin(body.authorizationCode)
    }

    @ApiBody({
        type: UpdateConsentRequest,
        description: 'user update usage consent response',
        required: true,
    })
    @ApiResponse({
        type: TokenDto
    })
    @Post('/consent')
    public updateConsent(
        @Body() body:  UpdateConsentRequest,
    ) {
        return this._userService.updateUserConsent(body)
    }
}
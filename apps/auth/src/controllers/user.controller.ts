import {
    Controller,
    Get,
    Inject,
    Param,
    Query,
} from '@nestjs/common'
import { ProviderName } from '@libs/common/constants/providerName'
import { IAuthenticationService } from '../services/interfaces/authentication-service.interface'
import {
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'

@ApiTags('user')
@Controller('/users')
export class UserController {
    public constructor(
        @Inject(ProviderName.AUTHENTICATION_SERVICE)
        private readonly _authenticationService: IAuthenticationService,
    ) {
    }

    @ApiOperation({
        description: 'user login using LINE integration'
    })
    @ApiParam({
        name: 'code',
        type: 'string',
        description: 'line authorization code',
    })
    @ApiResponse({
        description: 'return access and refresh token',
        example: {
            accessToken: 'eyJhbGciOiJSUzI1Ni..,.',
            refreshToken: 'eyJhbGciOiJSUzI1Ni...'
        }
    })
    @Get('/login')
    public userLoginWithLINE(
        @Query('code') code: string,
    ) {
        return this._authenticationService.doLineLogin(code)
    }
}
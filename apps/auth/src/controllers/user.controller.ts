import {
    Body,
    Controller,
    Inject,
    Post,
} from '@nestjs/common'
import { ProviderName } from '@libs/common/constants/providerName'
import { IAuthenticationService } from '../services/interfaces/authentication-service.interface'
import { LoginRequest } from '@libs/common/models/user/login.request'
import {
    ApiBody,
    ApiCreatedResponse,
    ApiTags,
} from '@nestjs/swagger'

@ApiTags('users')
@Controller('/users')
export class UserController {
    public constructor(
        @Inject(ProviderName.AUTHENTICATION_SERVICE)
        private readonly _authenticationService: IAuthenticationService,
    ) {
    }

    @ApiBody({
        type: LoginRequest,
        description: 'login body',
    })
    @Post('/login')
    public userLogin(
        @Body() body: LoginRequest,
    ) {
        return this._authenticationService.doLogin(body.username, body.password)
    }
}
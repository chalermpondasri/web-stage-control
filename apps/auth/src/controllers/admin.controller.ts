import {
    Body,
    Controller,
    Inject,
    Post,
} from '@nestjs/common'
import { ProviderName } from '@libs/common/constants/providerName'
import { IAuthenticationService } from '../services/interfaces/authentication-service.interface'
import { CreateUserRequest } from '@libs/common/models/user/create-user.request'

@Controller('/admin')
export class AdminController {

    public constructor(
        @Inject(ProviderName.AUTHENTICATION_SERVICE)
        private readonly _authenticationService: IAuthenticationService,
    ) {
    }

    @Post('/users')
    public adminLogin(
        @Body() body: CreateUserRequest,
    ) {
        return this._authenticationService.createUser(body.username, body.password)
    }
}
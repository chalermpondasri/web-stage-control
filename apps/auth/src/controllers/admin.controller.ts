import {
    Body,
    Controller,
    Inject,
    Post,
} from '@nestjs/common'
import { ProviderName } from '@libs/common/constants/providerName'
import { IAuthenticationService } from '../services/interfaces/authentication-service.interface'
import { CreateUserRequest } from '@libs/common/models/user/create-user.request'
import {
    ApiBody,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger'

@ApiTags('Super Admin')
@Controller('/admin')
export class AdminController {

    public constructor(
        @Inject(ProviderName.AUTHENTICATION_SERVICE)
        private readonly _authenticationService: IAuthenticationService,
    ) {
    }

    @ApiOperation({
        description: 'Create new community admin',
    })
    @ApiBody({
        type: CreateUserRequest,
        description: 'Community admin information to be created'
    })
    @Post('/users')
    public createCommunityAdmin(
        @Body() body: CreateUserRequest,
    ) {
        return this._authenticationService.createUser(body.username, body.password)
    }
}
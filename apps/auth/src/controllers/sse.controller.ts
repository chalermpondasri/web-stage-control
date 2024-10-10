import {
    Controller,
    Inject,
    MessageEvent,
    Sse,
} from '@nestjs/common'
import {
    Observable,
} from 'rxjs'
import { IAuthenticationService } from '../services/interfaces/authentication-service.interface'
import { ProviderName } from '@libs/common/constants/providerName'

@Controller('/sses')
export class SseController {

    constructor(
        @Inject(ProviderName.AUTHENTICATION_SERVICE)
        private readonly _authService: IAuthenticationService,
    ) {
    }
    @Sse('sse')
    public testSendEvent():Observable<MessageEvent> {
        return this._authService.subscribeSse()
    }
}

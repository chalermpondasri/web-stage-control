import { UpdateConsentRequest } from '@libs/common/models/user/update-consent.request'
import { Observable } from 'rxjs'
import { TokenDto } from '@libs/common/models/common/token.dto'

export interface IUserService {
    updateUserConsent(request: UpdateConsentRequest): Observable<TokenDto>
}
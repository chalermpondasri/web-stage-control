import { UpdateConsentRequest } from '@libs/common/models/user/update-consent.request'
import { Observable } from 'rxjs'
import { TokenDto } from '@libs/common/models/common/token.dto'
import { UserProfileDto } from '@libs/common/models/user/user-profile.dto'
import { UpdateProfileRequest } from '@libs/common/models/user/update-profile.request'

export interface IUserService {
    updateUserConsent(request: UpdateConsentRequest): Observable<TokenDto>
    getUserProfile(): Observable<UserProfileDto>
    updateUserProfile(request: UpdateProfileRequest): Observable<UserProfileDto>
}
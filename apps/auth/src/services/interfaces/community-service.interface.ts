import { CommunityDto } from '@libs/common/models/community/community.dto'
import { Observable } from 'rxjs'

export interface ICommunityService {
    getCommunityId(communityId: string): Observable<CommunityDto>
}
import { Observable } from 'rxjs'

export interface IRankingService {
    getCommunityBoostRanking(communityId: string): Observable<any>
}
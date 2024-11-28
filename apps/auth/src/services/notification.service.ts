import { SuggestionRequest } from '@libs/common/models/user/suggestion.request'
import {
    from,
    mergeMap,
    Observable,
} from 'rxjs'
import { INotificationService } from './interfaces/user-service.interface'
import { IMailer } from '@libs/providers/mailer/interfaces/mailer.interface'
import { RequestContext } from '@libs/providers/request-context.provider'
import { Repository } from 'typeorm'
import { User } from '@libs/entities/user.entity'

export class NotificationService implements INotificationService {
    constructor(
        private readonly _requestContext: RequestContext,
        private readonly _userRepository: Repository<User>,
        private readonly _mailer: IMailer,
    ) {
    }

    public sendSuggestion(request: SuggestionRequest): Observable<any> {
        return from(this._userRepository.findOneBy({ id: this._requestContext.identityInfo.userId })).pipe(
            mergeMap(user => {
                return this._mailer.sendEmail(
                    ['support@wealthup.co.th'],
                    '[UMU][Suggestion] Music Suggestion',
                    `
                    text: ${request.text}\nadditional
                    note: ${request.additionalNote}
                    
                    from: ${user.name} (id: ${user.id}) (line: ${user.lineId})
                    `,
                )
            }),
        )
    }
}
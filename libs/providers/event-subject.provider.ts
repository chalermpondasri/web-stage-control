import { ProviderName } from '@libs/common/constants/providerName'
import {
    Subject,
} from 'rxjs'
import {
    MessageEvent,
    Provider,
} from '@nestjs/common'

export const eventSubjectProvider: Provider = {
    provide: ProviderName.SSE_SUBJECT,
    useFactory: () => new Subject<MessageEvent>(),
}

export const eventSubjectFactoryProvider: Provider = {
    provide: ProviderName.SSE_EVENT_SUBJECT_FACTORY,
    useFactory: () => new EventSubjectFactory()
}

export class EventSubjectFactory {
    private readonly _subjects: Map<string, Subject<MessageEvent>>

    public constructor() {
        this._subjects = new Map<string, Subject<MessageEvent>>()
    }

    public getSubject(key: string): Subject<MessageEvent> {
        let targetSubject = this._subjects.get(key)

        if(!targetSubject) {
            targetSubject = new Subject<MessageEvent>()
            this._subjects.set(key, targetSubject)
        }

        return targetSubject

    }

    public push(key: string,type: string,  data: any) {
        this.getSubject(key).next({ type, data })
    }
}
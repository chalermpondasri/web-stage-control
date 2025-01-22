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

export const playlistSubjectFactoryProvider: Provider = {
    provide: ProviderName.SSE_PLAYLIST_SUBJECT_FACTORY,
    useFactory: () => new EventSubjectFactory()
}
export const paymentSubjectFactoryProvider: Provider = {
    provide: ProviderName.SSE_PAYMENT_SUBJECT,
    useFactory: () => new EventSubjectFactory()
}

interface IPushOptions {
    delete: boolean
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

    private _delete(key: string) {
        this._subjects.delete(key)
    }

    public push(key: string,type: string,  data: any, opts?: IPushOptions) {
        const subject = this.getSubject(key)

        subject.next({ type, data })

        if(opts?.delete) {
            subject.complete()
            this._delete(key)
        }

    }
}
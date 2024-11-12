import { Injectable, MessageEvent } from '@nestjs/common'
import { Observable, Subject } from 'rxjs'

@Injectable()
export class BroadcastSseService {
    private eventStreams: { [key: string]: Subject<MessageEvent> } = {}

    getStream(communityId: string): Observable<MessageEvent> {
        if (!this.eventStreams[communityId]) {
            this.eventStreams[communityId] = new Subject<MessageEvent>()
        }
        return this.eventStreams[communityId].asObservable()
    }

    sendEvent(communityId: string, data: MessageEvent) {
        if (!this.eventStreams[communityId]) {
            this.eventStreams[communityId] = new Subject<MessageEvent>()
        }
        this.eventStreams[communityId].next(data)
    }
}

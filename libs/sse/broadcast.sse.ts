import { Injectable, MessageEvent } from '@nestjs/common'
import { Subject } from 'rxjs'

@Injectable()
export class BroadcastSseService {
    private eventStream = new Subject<MessageEvent>()

    getStream() {
        return this.eventStream.asObservable()
    }

    sendEvent(data: MessageEvent) {
        this.eventStream.next(data)
    }
}

import {
    Controller,
    MessageEvent,
    Sse,
} from '@nestjs/common'
import {
    interval,
    map,
    Observable,
} from 'rxjs'

@Controller('/sses')
export class SseController {
    @Sse('sse')
    public testSendEvent():Observable<MessageEvent> {
        return interval(1000)
            .pipe(
                map(_ => ({ data: { hello: 'world' } })),
            )
    }
}

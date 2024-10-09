import { ProviderName } from '@libs/common/constants/providerName'
import { Subject } from 'rxjs'
import {
    MessageEvent,
    Provider,
} from '@nestjs/common'

export const eventSubjectProvider: Provider = {
    provide: ProviderName.SSE_SUBJECT,
    useFactory: () =>new Subject<MessageEvent>(),
}
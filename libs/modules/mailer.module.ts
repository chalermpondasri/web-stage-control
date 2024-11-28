import { Module } from '@nestjs/common'
import { GlobalModule } from '@libs/modules/global.module'
import {
    mailerServiceProvider,
    mailTransporterProvider,
} from '@libs/providers/mailer.provider'

@Module({
    imports: [GlobalModule],
    providers: [
        mailTransporterProvider,
        mailerServiceProvider,
    ],
    exports: [
        mailerServiceProvider,
    ]
})
export class MailerModule {

}
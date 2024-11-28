import { ProviderName } from '@libs/common/constants'
import { EnvironmentConfig } from '@libs/common/models/common'
import { Provider, Scope } from '@nestjs/common'
import { Transporter, createTransport } from 'nodemailer'
import { MailerService } from '@libs/providers/mailer/mailer.service'

export const mailerServiceProvider: Provider = {
    provide: ProviderName.MAILER_SERVICE,
    scope: Scope.TRANSIENT,
    inject: [ProviderName.ENV_CONFIG, ProviderName.MAIL_TRANSPORTER],
    useFactory: (config: EnvironmentConfig, transporter: Transporter) => {
        return new MailerService(config.NOTIFICATION_USERNAME, transporter)
    },
}
export const mailTransporterProvider: Provider = {
    provide: ProviderName.MAIL_TRANSPORTER,
    inject: [ProviderName.ENV_CONFIG],
    useFactory: (config: EnvironmentConfig) => {
        let transporter: Transporter
        if (config.NODE_ENV.localeCompare('staging', undefined, { sensitivity: 'accent' }) === 0) {
            transporter = createTransport({
                host: config.NOTIFICATION_HOST,
                port: Number(config.NOTIFICATION_PORT),
                secure: false,
            })
        } else {
            transporter = createTransport({
                host: config.NOTIFICATION_HOST,
                port: Number(config.NOTIFICATION_PORT),
                secure: false,
                auth: {
                    user: config.NOTIFICATION_USERNAME,
                    pass: config.NOTIFICATION_PASSWORD,
                },
            })
        }
        return transporter
    },
}

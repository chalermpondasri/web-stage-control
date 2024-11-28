import { Transporter } from 'nodemailer'
import { EmailAddress, IMailer, ISendEmailOpts } from './interfaces/mailer.interface'

export class MailerService implements IMailer {
    public constructor(
        private readonly _user: string,

        private readonly _transporter: Transporter,
    ) {}

    public async sendEmail(receivers: EmailAddress[], subject: string, contents: string, options?: ISendEmailOpts) {
        return this._transporter
            .sendMail({
                from: this._user,
                to: receivers,
                subject,
                html: contents,
                cc: options?.cc,
                bcc: options?.bcc,
                attachments: options?.attachments,
            })
            .then((result) => {
                console.log(result)
                return true
            })
            .catch((err) => {
                console.log(err)
                return false
            })
    }
}

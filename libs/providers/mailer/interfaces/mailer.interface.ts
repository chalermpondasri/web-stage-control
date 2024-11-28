import { Attachment } from 'nodemailer/lib/mailer'

export type EmailAddress = string

export interface IEmailContent {
    subject: string
    body: string
}

export interface ISendEmailOpts {
    cc?: EmailAddress[]
    bcc?: EmailAddress[]
    attachments?: Attachment[]
}

export interface IMailer {
    sendEmail(receivers: EmailAddress[], subject: string, contents: string, options?: ISendEmailOpts): Promise<boolean>
}

import { Transform } from 'class-transformer'
import { IsEmail, IsNotEmpty, IsNumber, IsOptional } from 'class-validator'

export class EnvironmentConfig {
    @IsNotEmpty()
    public declare readonly NODE_ENV: string

    @IsNotEmpty()
    public declare readonly DB_HOSTS: string

    public declare readonly DB_USERNAME: string

    public declare readonly DB_PASSWORD: string
    @IsNotEmpty()
    public declare readonly DB_NAME: string
    public declare readonly DB_REPL_NAME: string

    @IsNotEmpty()
    public declare readonly CMS_API_KEY: string
    @IsNotEmpty()
    public declare readonly CMS_ENDPOINT: string

    @IsNotEmpty()
    public declare readonly SMS_GATEWAY_ENDPOINT: string
    @IsNotEmpty()
    public declare readonly SMS_GATEWAY_API_KEY: string
    @IsNotEmpty()
    public declare readonly SMS_GATEWAY_SECRET_KEY: string
    @IsOptional()
    public declare readonly SMS_GATEWAY_PROJECT_KEY: string

    @IsNotEmpty()
    public declare readonly JWT_ACCESS_SECRET: string

    @IsNotEmpty()
    public declare readonly JWT_ACCESS_TTL: string
    @IsNotEmpty()
    public declare readonly JWT_REFRESH_TTL: string

    @IsNotEmpty()
    public declare readonly JWT_REFRESH_SECRET: string

    public declare readonly MESSAGE_BROKER_USERNAME: string
    public declare readonly MESSAGE_BROKER_PASSWORD: string
    @IsNotEmpty()
    public declare readonly MESSAGE_BROKER_HOST: string
    public declare readonly MESSAGE_BROKER_VIRTUAL_HOST: string
    public declare readonly MESSAGE_BROKER_PORT: string
    @IsNotEmpty()
    public declare readonly MESSAGE_BROKER_QUEUE_NAME: string

    public declare readonly NOTIFICATION_HOST: string
    public declare readonly NOTIFICATION_PORT: number

    @IsNotEmpty()
    public declare readonly NOTIFICATION_USERNAME: string
    public declare readonly NOTIFICATION_PASSWORD: string

    @IsNotEmpty()
    public declare readonly FRONTEND_URL: string

    @IsNotEmpty()
    public declare readonly REDIS_HOST: string

    @IsNotEmpty()
    public declare readonly REDIS_PORT: string

    public declare readonly REDIS_USER: string

    public declare readonly REDIS_PASS: string

    @IsNotEmpty()
    public declare readonly GOOGLE_APPLICATION_CREDENTIALS: string

    @IsNotEmpty()
    @IsEmail({}, { each: true })
    @Transform(({ value }) => String(value).split(','))
    public declare readonly SUPPORT_EMAILS: string[]

    @IsNotEmpty()
    public declare readonly ELASTIC_CLIENT_CA: string
    @IsNotEmpty()
    public declare readonly ELASTIC_CLIENT_USERNAME: string
    @IsNotEmpty()
    public declare readonly ELASTIC_CLIENT_PASSWORD: string
    @IsNotEmpty()
    @Transform(({ value }) => String(value).split(','))
    public declare readonly ELASTIC_CLIENT_NODES: string[]

    @IsNotEmpty()
    public declare readonly ENC_SECRET: string
    @IsNotEmpty()
    public declare readonly ENC_SALT: string

    @IsNotEmpty()
    public declare readonly RDB_HOST: string
    @IsNumber()
    @Transform(({ value }) => Number(value))
    public declare readonly RDB_PORT: number
    @IsNotEmpty()
    public declare readonly RDB_USERNAME: string
    @IsNotEmpty()
    public declare readonly RDB_PASSWORD: string
    @IsNotEmpty()
    public declare readonly RDB_DBNAME: string

    @IsOptional()
    @Transform(({ value }) => value === 'true')
    public readonly RDB_LOG: boolean = true

    @IsNotEmpty()
    public declare readonly ADS_SECRET: string
    @IsNotEmpty()
    public declare readonly ADS_SALT: string

    @IsNotEmpty()
    public LINE_CLIENT_ID: string
    @IsNotEmpty()
    public LINE_CLIENT_SECRET: string
    @IsNotEmpty()
    public LINE_REDIRECT_URI: string
}

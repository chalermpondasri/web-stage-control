import crypto from 'crypto'
import { ProviderName } from '@libs/common/constants/providerName'
import { EnvironmentConfig } from '@libs/common/models'
import {
    Provider,
    Scope,
} from '@nestjs/common'
export interface IEncryptedData {
    encrypted: Buffer
}
export interface IEncryptionService {
    encrypt(data: string): IEncryptedData
    decrypt(data: IEncryptedData): string
}
export class EncryptionService implements IEncryptionService {
    private readonly _key: Buffer

    public constructor(secret: string, salt: string) {
        this._key = crypto.scryptSync(secret, salt, 32)
    }

    public encrypt(data: string): IEncryptedData {
        const initVector = crypto.randomBytes(12)
        const cipher = crypto.createCipheriv('aes-256-gcm', this._key, initVector)

        const encrypted = Buffer.concat([cipher.update(data), cipher.final(), initVector, cipher.getAuthTag()])
        return {
            encrypted,
        }
    }

    public decrypt(data: IEncryptedData): string {
        const { encrypted } = data
        const iv = encrypted.subarray(encrypted.length - 28, encrypted.length - 16)
        const authTag = encrypted.subarray(encrypted.length - 16)
        const content = encrypted.subarray(0, encrypted.length - 28)
        const decipher = crypto.createDecipheriv('aes-256-gcm', this._key, iv).setAuthTag(authTag)
        return Buffer.concat([decipher.update(content), decipher.final()]).toString()
    }
}

export const encryptionServiceProvider: Provider = {
    provide: ProviderName.ENCRYPTION_SERVICE,
    scope: Scope.REQUEST,
    inject: [ProviderName.ENV_CONFIG],
    useFactory: (config: EnvironmentConfig) => {
        return new EncryptionService(config.ENC_SECRET, config.ENC_SALT)
    },
}
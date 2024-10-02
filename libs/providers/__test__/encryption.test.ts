import { EncryptionService } from '../encryption.provider'

describe('encryption test', () => {
    it('can encrypt and decrypt messages', () => {
        const service = new EncryptionService('secret', 'some-salt')
        const encrypted = service.encrypt('message')
        const decrypt = service.decrypt(encrypted)
        expect('message' === decrypt)
    })
})

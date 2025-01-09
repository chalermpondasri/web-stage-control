import {
    AppleIdTokenResponse,
    IAppleIntegration,
} from '@libs/repositories/interfaces/apple-integration.interface'
import {
    PublicKey,
    verify,
} from 'jsonwebtoken'

export class AppleIntegrationRepository implements IAppleIntegration {

    public constructor(
        private readonly _teamId: string,
        private readonly _clientId: string,
        private readonly _keyId: string,
        private readonly _applePublicKeys: PublicKey,
        private readonly _privateKey: string,
    ) {
    }

    public async validate(idToken: string): Promise<AppleIdTokenResponse> {
        const token = <AppleIdTokenResponse>verify(idToken, this._applePublicKeys, { algorithms: ['RS256'] })
        const {
            iss,
            aud,
            exp,
        } = token
        if (iss !== 'https://appleid.apple.com' || aud !== this._clientId || exp <= Math.floor(Date.now() / 1000)) {
            throw new Error('INVALID_APPLE_ID_TOKEN', {
                cause: {
                    iss, aud, exp
                },
            })
        }

        return token
    }

}
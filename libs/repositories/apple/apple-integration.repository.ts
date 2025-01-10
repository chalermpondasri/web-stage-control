import {
    AppleIdTokenResponse,
    IAppleIntegration,
} from '@libs/repositories/interfaces/apple-integration.interface'
import {
    decode,
    PublicKey,
    verify,
} from 'jsonwebtoken'
import jwksClient, { JwksClient } from 'jwks-rsa'

export class AppleIntegrationRepository implements IAppleIntegration {

    private readonly _jwksClient: JwksClient

    public constructor(
        private readonly _teamId: string,
        private readonly _clientId: string,
        private readonly _keyId: string,
        private readonly _applePublicKeys: PublicKey,
        private readonly _privateKey: string,
    ) {

        this._jwksClient = jwksClient({
            jwksUri: 'https://appleid.apple.com/auth/keys',
        })
    }

    private async _verify(token: string, publicKey: string):Promise<AppleIdTokenResponse> {
        return  new Promise((resolve, reject) => {
            verify(token, publicKey, (error, decoded) => {
                if(error) {
                    return reject(error)
                }
                return resolve(<AppleIdTokenResponse>decoded)
            })

        })

    }

    public async validate(idToken: string): Promise<AppleIdTokenResponse> {
        const decoded =  decode(idToken,  {complete: true})
        const key = await this._jwksClient.getSigningKey(decoded.header.kid)
        const token = await this._verify(idToken, key.getPublicKey())
        const {
            iss,
            aud,
            exp,
        } = token
        if (iss !== 'https://appleid.apple.com' || aud !== this._clientId || exp <= Math.floor(Date.now() / 1000)) {
            throw new Error('INVALID_APPLE_ID_TOKEN', {
                cause: {
                    iss, aud, exp,
                },
            })
        }

        return token
    }

}
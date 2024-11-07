import { Jwt, decode, sign, verify } from 'jsonwebtoken'
import { v4 } from 'uuid'
import { IKeySigner } from '@libs/providers/tokenization/tokenization-service.interface'

export class JwtSignerService implements IKeySigner {
    private readonly _secret: Buffer

    public constructor(base64Key: string) {
        this._secret = Buffer.from(base64Key, 'base64')
    }

    public decode(token: string): Jwt | null {
        return decode(token, { json: true, complete: true })
    }

    public sign(data: object, ttl = '15m'): string {
        return sign(data, this._secret, {
            algorithm: 'RS256',
            expiresIn: ttl,
            jwtid: v4(),
        })
    }

    public verify(token: string): Jwt | null {
        try {
            return verify(token, this._secret, {
                ignoreExpiration: false,
                complete: true,
            })
        } catch (e) {
            return null
        }
    }
}

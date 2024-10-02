import { Jwt } from 'jsonwebtoken'
import { JwtSignerService } from './jwt-signer.service'
import { ITokenizationService } from './interfaces/tokenization-service.interface'

export class TokenizationService implements ITokenizationService {
    private readonly _accessTokenSigner: JwtSignerService
    private readonly _refreshTokenSigner: JwtSignerService

    public constructor(
        jwtSecret: string,
        refreshSecret: string,
        private readonly _accessTokenTTL: string,
        private readonly _refreshTokenTTL: string,
    ) {
        this._accessTokenSigner = new JwtSignerService(jwtSecret)
        this._refreshTokenSigner = new JwtSignerService(refreshSecret)
    }

    public createAccessToken(data: object): string {
        return this._accessTokenSigner.sign(data, this._accessTokenTTL)
    }

    public createRefreshToken(data: object): string {
        return this._refreshTokenSigner.sign(data, this._refreshTokenTTL)
    }

    public verifyRefreshToken(token: string): Jwt {
        return this._refreshTokenSigner.verify(token)
    }

    public verifyAccessToken(token: string): Jwt {
        return this._accessTokenSigner.verify(token)
    }

    public decode(token: string, keyType: 'accessToken' | 'refreshToken'): Jwt {
        switch (keyType) {
            case 'accessToken':
                return this._accessTokenSigner.decode(token)
            case 'refreshToken':
                return this._refreshTokenSigner.decode(token)
        }
    }
}

import { ProviderName } from '@libs/common/constants'
import { EnvironmentConfig } from '@libs/common/models'
import {
    AlbumApi,
    ArtistApi,
    CoinPackageApi,
    Configuration,
    ConfigurationParameters,
    GenreApi,
    StickerApi,
    TrackApi,
    VoucherApi,
} from '@libs/repositories/strapi-api'
import { Provider } from '@nestjs/common'

export interface StrapiClient {
    albumApi: AlbumApi
    artistApi: ArtistApi
    trackApi: TrackApi
    genreApi: GenreApi
    coinPackage: CoinPackageApi
    voucherApi: VoucherApi
    stickerApi: StickerApi
}

export const strapiClientProvider: Provider = {
    provide: ProviderName.STRAPI_CLIENT,
    inject: [
        ProviderName.ENV_CONFIG,
    ],
    useFactory: async (config: EnvironmentConfig) => {
        const configParams: ConfigurationParameters = {
            basePath: config.CMS_ENDPOINT,
            accessToken: config.CMS_API_KEY,
        }

        const apiConfig = new Configuration(configParams)

        const apiClient: StrapiClient = {
            albumApi: new AlbumApi(apiConfig),
            artistApi: new ArtistApi(apiConfig),
            trackApi: new TrackApi(apiConfig),
            genreApi: new GenreApi(apiConfig),
            coinPackage: new CoinPackageApi(apiConfig),
            voucherApi: new VoucherApi(apiConfig),
            stickerApi: new StickerApi(apiConfig),
        }

        return apiClient
    },
}

import { Provider } from '@nestjs/common'
import { ProviderName } from '@libs/common/constants'
import { DiscordAdapter } from '@libs/utilities/adapter/discord.adapter'
import { EnvironmentConfig } from '@libs/common/models'

export const loggingDiscordProvider: Provider = {
    provide: ProviderName.LOGGING_DISCORD,
    inject: [
        ProviderName.ENV_CONFIG
    ],
    useFactory: (cfg: EnvironmentConfig) => {
        return new DiscordAdapter(cfg.DISCORD_LOGGING_STAGE)
    }
}

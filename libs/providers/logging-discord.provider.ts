import { Provider } from '@nestjs/common'
import { ProviderName } from '@libs/common/constants'
import { DiscordAdapter } from '@libs/utilities/adapter/discord.adapter'

export const loggingDiscordProvider: Provider = {
    provide: ProviderName.LOGGING_DISCORD,
    useFactory: () => new DiscordAdapter()
}
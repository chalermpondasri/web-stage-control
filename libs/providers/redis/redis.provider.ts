import { ProviderName } from '@libs/common/constants'
import { EnvironmentConfig } from '@libs/common/models/common'
import { Provider } from '@nestjs/common'
import { RedisClientType, createClient } from '@redis/client'
import { RedisService } from '@libs/providers/redis/redis.service'

export const redisServiceProvider: Provider = {
    provide: ProviderName.CACHE_SERVICE,
    inject: [ProviderName.ENV_CONFIG],
    async useFactory(config: EnvironmentConfig) {
        let url = `redis://${config.REDIS_HOST}:${config.REDIS_PORT}`
        if (config.REDIS_USER || config.REDIS_PASS) {
            url = `redis://${config.REDIS_USER}:${config.REDIS_PASS}@${config.REDIS_HOST}:${config.REDIS_PORT}`
        }
        const redisClient: RedisClientType = createClient({ url  })
        const client =  await redisClient.connect()
        return new RedisService(client)
    },
}

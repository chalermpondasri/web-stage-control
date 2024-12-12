import { Module } from '@nestjs/common'
import { envConfigProvider } from '@libs/providers/env.provider'
import { redisServiceProvider } from '@libs/providers/redis/redis.provider'

@Module({
    imports:[
    ],
    providers:[
        envConfigProvider,
        redisServiceProvider,
    ],
    exports:[
        redisServiceProvider,
    ],

})

export class CacheModule {

}
import {
    InternalServerErrorException,
    Provider,
} from '@nestjs/common'
import { EnvironmentConfig } from '@libs/common/models'
import { ProviderName } from '@libs/common/constants/providerName'
import { plainToInstance } from 'class-transformer'
import { validateSync } from 'class-validator'
import * as process from 'process'
import { configDotenv } from 'dotenv'

export const envConfigProvider: Provider = {
    provide: ProviderName.ENV_CONFIG,
    useFactory: () => {
        configDotenv({encoding: 'utf8'})
        const env = plainToInstance(EnvironmentConfig, process.env)
        const errors = validateSync(env)
        if (errors.length !== 0) {
            throw new InternalServerErrorException(errors.join(','))
        }
        return env
    },
}

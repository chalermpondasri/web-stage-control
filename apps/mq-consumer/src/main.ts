// Fix for RabbitSubscriber can not access env in decorator.
import { config } from 'dotenv'
config()

import { NestFactory } from '@nestjs/core'
import { MainModule } from './modules/main.module'
async function bootstrap() {
    const app = await NestFactory.createApplicationContext(MainModule)
    app.enableShutdownHooks()
}
bootstrap()

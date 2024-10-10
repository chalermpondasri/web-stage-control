import { NestFactory } from '@nestjs/core'
import { MainModule } from './modules/main.module'

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(MainModule)
    app.enableShutdownHooks()
}
bootstrap()

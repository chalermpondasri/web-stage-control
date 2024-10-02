import { NestFactory } from '@nestjs/core'
import { MainModule } from './modules/main.module'
import {
    PipeTransform,
    ValidationPipe,
} from '@nestjs/common'

async function bootstrap(){
    const app = await NestFactory.create(MainModule, {
        bufferLogs: true
    })
    app.enableCors()

    const nestValidationPipes: PipeTransform[] = [
        new ValidationPipe({
            transform: true,
        }),
    ]

    app.useGlobalPipes(...nestValidationPipes)

    return (await app).listen(3000)
}

bootstrap()
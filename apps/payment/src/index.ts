import { PipeTransform, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { PaymentModule } from './modules/payment.module'

async function bootstrap() {
    const app = await NestFactory.create(PaymentModule, {
        bufferLogs: true,
    })

    app.enableCors()
    const nestValidationPipes: PipeTransform[] = [
        new ValidationPipe({
            transform: true,
        }),
    ]

    app.useGlobalPipes(...nestValidationPipes)

    await app.listen(process.env.PORT || 3002)
}

bootstrap()

import { config } from 'dotenv'
config()

import { PipeTransform, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { PaymentModule } from './modules/payment.module'

async function bootstrap() {
    const app = await NestFactory.create(PaymentModule, {
        bufferLogs: true,
    })

    app.enableCors()

    app.setGlobalPrefix('/payments')
    const config = new DocumentBuilder()
        .setTitle('Community Billboard: Payments')
        .setDescription('Community Billboard Payment API Description')
        .setVersion('1.0')
        .addTag('payment')
        .addBearerAuth()
        .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('documentation', app, document)

    const nestValidationPipes: PipeTransform[] = [
        new ValidationPipe({
            transform: true,
        }),
    ]

    app.useGlobalPipes(...nestValidationPipes)

    await app.listen(process.env.PORT || 3000)
}

bootstrap()

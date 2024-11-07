import { PipeTransform, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { MainModule } from './modules/main.module'

async function bootstrap() {
    const app = await NestFactory.create(MainModule, {
        bufferLogs: true,
        forceCloseConnections: true,
    })

    app.enableCors()
    const config = new DocumentBuilder()
        .setTitle('UMU broadcast service')
        .setDescription('UMU broadcast service API Description')
        .setVersion('1.0')
        .addBearerAuth({
            scheme: 'bearer',
            type: 'http',
        })
        .addTag('umu')
        .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('documentation', app, document)

    const nestValidationPipes: PipeTransform[] = [
        new ValidationPipe({
            transform: true,
        }),
    ]

    app.useGlobalPipes(...nestValidationPipes)
    app.enableShutdownHooks()

    await app.listen(process.env.PORT || 3004)

    console.log(`🚀 Swagger is running on: ${await app.getUrl()}/documentation`)
}

bootstrap()

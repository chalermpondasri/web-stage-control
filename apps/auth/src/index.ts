import { NestFactory } from '@nestjs/core'
import { MainModule } from './modules/main.module'
import {
    PipeTransform,
    ValidationPipe,
} from '@nestjs/common'
import {
    DocumentBuilder,
    SwaggerModule,
} from '@nestjs/swagger'

async function bootstrap(){
    const app = await NestFactory.create(MainModule, {
        bufferLogs: true,
        forceCloseConnections: true,
    })
    app.enableCors()
    const config = new DocumentBuilder()
        .addBearerAuth({
            scheme: "bearer",
            type: "http"
        })
        .setTitle('Community Billboard')
        .setDescription('Community Billboard API Description')
        .setVersion('1.0')
        .addTag('billboard')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('documentation', app, document);

    const nestValidationPipes: PipeTransform[] = [
        new ValidationPipe({
            transform: true,
        }),
    ]

    app.useGlobalPipes(...nestValidationPipes)
    app.enableShutdownHooks()


    return (await app).listen(3000)
}

bootstrap()
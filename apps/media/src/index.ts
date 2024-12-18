import { NestFactory } from '@nestjs/core'
import { MainModule } from './modules/main.module'
import {
    DocumentBuilder,
    SwaggerModule,
} from '@nestjs/swagger'
import {
    PipeTransform,
    ValidationPipe,
} from '@nestjs/common'

async function bootstrap(){
    const app = await NestFactory.create(MainModule, {
        bufferLogs: true,
        forceCloseConnections: true,
    })
    app.enableCors()
    app.setGlobalPrefix('/media')
    const config = new DocumentBuilder()
        .setTitle('Community Billboard')
        .setDescription('Community Billboard API Description')
        .setVersion('1.0')
        .addTag('Media')
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


    return app.listen(3000)
}

bootstrap()
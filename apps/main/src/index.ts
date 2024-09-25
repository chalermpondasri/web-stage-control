import { NestFactory } from '@nestjs/core'
import { MainModule } from './modules/main.module'

console.log('hello world')
async function bootstrap(){
    const app = NestFactory.create(MainModule, {
        bufferLogs: true
    })

    return (await app).listen(3000)
}

bootstrap()
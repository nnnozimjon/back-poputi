import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Enable CORS
    app.enableCors({
        origin: [
            // 'http://localhost:3000',
            'https://poputi.tj',
            'https://www.poputi.tj',
            'https://test.poputi.tj',
            'https://paputi.tj',
        ],        
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: 'Content-Type, Authorization',
    });

    app.useGlobalPipes(new ValidationPipe());

    app.setGlobalPrefix('api/client');
    
    await app.listen(process.env.PORT || 3000);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

    // Enable CORS
    app.enableCors({
      origin: ['poputi.tj', 'test.poputi.tj', 'paputi.tj'], // Allow all origins (Change this to specific origins in production)
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      allowedHeaders: 'Content-Type, Authorization',
    });

  app.useGlobalPipes(new ValidationPipe());

   // Set global prefix for all routes
   app.setGlobalPrefix('api/client'); // This will make all routes start with "/api/client"

  await app.listen(process.env.PORT || 3000);
}
bootstrap();

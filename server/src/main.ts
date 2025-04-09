import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.enableCors({
    origin: [
      'http://localhost:3000',
      // 'https://main.d3hokgerfetl68.amplifyapp.com',
    ],
    credentials: true, // Allow cookies/auth headers if needed
  });
  await app.listen(process.env.PORT ?? 8001);
}
bootstrap();

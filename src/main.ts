import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser()); // ⚠️ indispensable pour req.cookies.jwt

  app.enableCors({
    origin: 'https://petite-annonce.vercel.app',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'baggage',
      'sentry-trace',
    ],
  });

  await app.listen(3000);
}
bootstrap();

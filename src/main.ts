import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    },
  });
  await app.listen(process.env.PORT as string);
}

bootstrap();

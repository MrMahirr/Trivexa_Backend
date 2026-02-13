import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Global pipes, filters, interceptors could be added here
  // await app.listen(process.env.PORT ?? 3500);
  await app.listen(3500);
}
bootstrap();

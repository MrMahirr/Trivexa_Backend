import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

import { isAbsolute, resolve } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Global Prefix
  const prefix = configService.get('app.apiPrefix', 'api/v1');
  app.setGlobalPrefix(prefix);

  // Security
  app.use(helmet(configService.get('security.helmet')));
  app.use(compression());
  app.enableCors(configService.get('security.cors'));

  // Static Assets (Uploads)
  const uploadDir =
    configService.get<string>('storage.local.uploadDir') || './uploads';
  const resolvedUploadDir = isAbsolute(uploadDir)
    ? uploadDir
    : resolve(process.cwd(), uploadDir);
  app.useStaticAssets(resolvedUploadDir, {
    prefix: '/uploads/',
  });

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Trivexa API')
    .setDescription('Trivexa backend API dokümantasyonu')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token',
    )
    .addTag('Auth', 'Kimlik doğrulama işlemleri')
    .addTag('Users', 'Kullanıcı yönetimi')
    .addTag('Clients', 'Müşteri (Firma) yönetimi')
    .addTag('Projects', 'Proje yönetimi')
    .addTag('Tasks', 'Görev yönetimi')
    .addTag('TimeTracking', 'Zaman takibi ve Worklog')
    .addTag('Tickets', 'Destek talepleri')
    .addTag('Invoices', 'Faturalar')
    .addTag('Expenses', 'Giderler')
    .addTag('Payments', 'Ödemeler')
    .addTag('Contracts', 'Sözleşmeler')
    .addTag('Meetings', 'Toplantı yönetimi')
    .addTag('Departments', 'Departman yönetimi')
    .addTag('Roles', 'Görev/Rol yetkilendirmeleri')
    .addTag('Reports', 'Raporlama sistemi')
    .addTag('Notifications', 'Bildirim yönetimi')
    .addTag('Files', 'Dosya yükleme & storage')
    .addTag('Audit', 'Denetim kayıtları')
    .addTag('Health', 'Sistem durumu')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  // Global Pipes & Filters
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  const port = configService.get('app.port', 3500);
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();

import { DocumentBuilder } from '@nestjs/swagger';

/**
 * Swagger/OpenAPI yapılandırması.
 * main.ts'de `SwaggerModule.createDocument(app, swaggerConfig)` olarak kullanılır.
 */
export const swaggerConfig = new DocumentBuilder()
  .setTitle('Trivexa Project Management API')
  .setDescription(
    'Trivexa — Ajans Yönetim Sistemi Backend API. ' +
      'Müşteriler, projeler, görevler, faturalar, zaman takibi, ' +
      'toplantılar, sözleşmeler ve bildirim modüllerini kapsar.',
  )
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: 'JWT Access Token girin',
      in: 'header',
    },
    'access-token',
  )
  .addTag('Auth', 'Kimlik doğrulama işlemleri')
  .addTag('Users', 'Kullanıcı yönetimi')
  .addTag('Clients', 'Müşteri yönetimi')
  .addTag('Projects', 'Proje yönetimi')
  .addTag('Tasks', 'Görev yönetimi')
  .addTag('Time Tracking', 'Zaman takibi')
  .addTag('Tickets', 'Destek biletleri')
  .addTag('Finance', 'Finans (Fatura, Ödeme, Gider)')
  .addTag('Contracts', 'Sözleşme yönetimi')
  .addTag('Meetings', 'Toplantı yönetimi')
  .addTag('Notifications', 'Bildirimler')
  .addTag('Reports', 'Raporlar')
  .addTag('Files', 'Dosya yönetimi')
  .addTag('Health', 'Sistem sağlık kontrolü')
  .build();

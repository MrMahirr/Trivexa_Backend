# Trivexa Backend - Detaylı Uygulama Yol Haritası (YAPILACAKLAR.md)

Bu belge, **Trivexa Backend** projesinin geliştirilmesi için **adım adım teknik detayları** içerir. Her bir madde birer pull-request veya commit büyüklüğündedir.

> **Son Güncelleme:** 28 Ocak 2026
> **Mevcut Durum:** Proje dosya yapısı oluşturuldu, içerikler implemente edilecek.

---

## ✅ 0. Proje Yapısı (Tamamlandı)
- [x] Proje mimarisi `Proje_Mimarisi.md` dosyasında belirlendi
- [x] `src/infrastructure/` dizini oluşturuldu (cache, queue, logging, monitoring)
- [x] `src/application/` dizini oluşturuldu (use-cases, dto, ports, transaction)
- [x] `src/domain/` dizini oluşturuldu (entities, value-objects, rules, errors)
- [x] `src/controllers/` dizini oluşturuldu
- [x] `src/common/middlewares/` yeniden adlandırıldı
- [x] `src/common/guards/auth/` oluşturuldu
- [x] Config dosyaları eklendi (redis, rate-limit, cors, feature-flags)

---

## 1. Hazırlık ve Altyapı (Infrastructure)

### Konfigürasyon ve Environment
- [ ] `src/config/app.config.ts`: `PORT`, `NODE_ENV`, `API_PREFIX` değerlerini `process.env`'den okuyacak şekilde yapılandır.
- [ ] `src/config/database.config.ts`: PostgreSQL bağlantı ayarlarını yapılandır.
- [ ] `src/config/jwt.config.ts`: `JWT_SECRET`, `JWT_EXPIRES_IN` değerlerini ayarla.
- [x] `src/config/redis.config.ts`: Redis yapılandırması oluşturuldu.
- [x] `src/config/rate-limit.config.ts`: Rate limit yapılandırması oluşturuldu.
- [x] `src/config/cors.config.ts`: CORS yapılandırması oluşturuldu.
- [x] `src/config/feature-flags.config.ts`: Feature flags yapılandırması oluşturuldu.
- [ ] `src/main.ts`:
    - [ ] `ValidationPipe` (whitelist: true) ekle.
    - [ ] `GlobalPrefix` ('api/v1') ayarla.
    - [ ] `Cors` aktif et.

### Veritabanı Katmanı (Database Core)
- [ ] `src/database/pool.ts`: `pg` kütüphanesini kullanarak `Pool` nesnesini implemente et.
- [ ] `src/database/transaction.ts`: `runTransaction<T>` fonksiyonunu implemente et.
- [ ] `src/database/pg/client.ts`: Database client wrapper oluştur.
- [ ] `src/database/error-mapping/pg-error.mapper.ts`: PostgreSQL hata mapping.
- [ ] **Migration Scriptleri**:
    - [ ] `docker/postgres/init/` altındaki SQL dosyalarını hazırla.
    - [ ] `scripts/seed.ts` seed scriptini implemente et.

### Ortak Yapılar (Common) - Dosyalar Mevcut, İçerik Gerekli
- [ ] `src/shared/dto/api-response.dto.ts`: Generic `ApiResponse<T>` sınıfını implemente et.
- [x] `src/common/filters/global-exception.filter.ts`: Oluşturuldu, implemente edildi.
- [ ] `src/common/filters/http-exception.filter.ts`: HttpException handler implemente et.
- [ ] `src/common/interceptors/response.interceptor.ts`: Response interceptor implemente et.
- [x] `src/infrastructure/logging/logger.service.ts`: Logger service oluşturuldu.
- [x] `src/infrastructure/monitoring/health.controller.ts`: Health check oluşturuldu.
- [x] `src/infrastructure/cache/redis.client.ts`: Redis client stub oluşturuldu.
- [x] `src/infrastructure/cache/rate-limit.store.ts`: Rate limit store stub oluşturuldu.

---

## 2. Kimlik ve Yetkilendirme (IAM)

### Modül: Auth & Users (Dosyalar Mevcut)
- [ ] **Data Access**: `src/modules/users/infrastructure/sql/users.sql.ts` içine SQL sorgularını yaz.
- [ ] **Repository**: `src/modules/users/infrastructure/repositories/user.repository.ts` implemente et.
- [ ] **UseCase**: `CreateUserUseCase` implemente et:
    - [ ] Email unique kontrolü
    - [ ] Şifre hashleme (`src/shared/security/encryption.service.ts`)
    - [ ] Kullanıcı kaydetme
- [ ] **JWT Auth**:
    - [ ] `src/modules/auth/application/usecases/login.usecase.ts` implemente et.
    - [x] `src/common/guards/auth/jwt.guard.ts` oluşturuldu, implemente edilecek.
    - [x] `src/common/guards/auth/client-token.guard.ts` oluşturuldu, implemente edilecek.

### Modül: Roles & Permissions (RBAC) (Dosyalar Mevcut)
- [ ] `src/shared/enums/permission.enum.ts`: İzinleri tanımla.
- [ ] `sql`: Rol ve İzin tablolarını bağla.
- [ ] `PermissionsGuard` implemente et.

---

## 3. İdari Modüller (Administration)

### Modül: Departments (Dosyalar Mevcut)
- [ ] CRUD işlemlerini implemente et.
- [ ] `users` tablosu ile `department_id` ilişkisini kur.

### Modül: Clients (Dosyalar Mevcut)
- [ ] `clients` tablosu CRUD implemente et.
- [ ] `client_users` tablosu implemente et.
- [ ] **Özellik**: "Magic Link" ile giriş.

---

## 4. Proje Yönetimi (Project Management)

### Modül: Projects (Dosyalar Mevcut)
- [ ] `projects` tablosu CRUD implemente et.
- [ ] Github Entegrasyonu (Manuel): `github_url` alanını güncelleme.

### Modül: Time Tracking (Dosyalar Mevcut)
- [ ] `time_entries` tablosu implemente et.
- [ ] **Logic**: `start-timer` use case.
- [ ] **Logic**: `stop-timer` use case.

### Modül: Tickets (Dosyalar Mevcut)
- [ ] `tickets` tablosu CRUD implemente et.
- [ ] Ticket durum geçişleri için validasyon.

### Modül: Meetings (Dosyalar Mevcut)
- [ ] `meetings` tablosu CRUD implemente et.
- [ ] `convert-to-ticket` use case.

### Modül: Contracts (Dosyalar Mevcut)
- [ ] `contracts` tablosu CRUD implemente et.
- [ ] Sözleşme durumu yönetimi.

---

## 5. Finans Modülü (Accounting Core)

### Defter-i Kebir (Ledger) Altyapısı (Dosyalar Mevcut)
- [ ] `accounts` tablosu (Hesap Planı) implemente et.
- [ ] `ledger_entries` tablosu implemente et.
- [ ] **Kural**: `SUM(debit) == SUM(credit)` enforce et.

### Alt Modüller (Dosyalar Mevcut)
- [ ] **Invoices**: Fatura oluşturma ve ledger kaydı.
- [ ] **Payments**: Tahsilat ve ledger kaydı.
- [ ] **Expenses**: Gider girişi ve ledger kaydı.
- [ ] **Vendors**: Tedarikçi yönetimi.

### Raporlama
- [ ] **Mizan (Trial Balance)**: Borç/alacak bakiyeleri.
- [ ] **Gelir Tablosu (P&L)**: Revenue ve Expense hesapları.
- [ ] **Nakit Akışı (Cash Flow)**: Nakit hareketleri raporu.
- [ ] **Yaşlandırma (Aging)**: Alacak yaşlandırma raporu.

---

## 6. Bildirimler ve Loglama

### Modül: Notifications (Dosyalar Mevcut)
- [ ] `notifications` tablosu CRUD implemente et.
- [ ] E-posta bildirim servisi.
- [ ] Push notification (opsiyonel).

### Modül: Audit (Dosyalar Mevcut)
- [ ] `audit_logs` tablosu implemente et.
- [ ] `AuditInterceptor` implemente et.
- [ ] Otomatik değişiklik loglama.

---

## 7. Altyapı Servisleri

### Queue (Kuyruk Sistemi)
- [ ] `src/infrastructure/queue/audit.producer.ts` implemente et.
- [ ] `src/infrastructure/queue/audit.consumer.ts` implemente et.
- [ ] `src/infrastructure/queue/dead-letter.queue.ts` implemente et.

### Monitoring
- [ ] Sentry entegrasyonu (`src/infrastructure/monitoring/sentry.service.ts`).
- [x] Health check endpoint'leri oluşturuldu.

---

## 8. Finalizasyon ve Test

### Testler
- [ ] **Unit Testler**: `test/unit/` altında test dosyaları.
- [ ] **Integration Testler**: `test/integration/` altında test dosyaları.
- [ ] **E2E Testler**: `test/e2e/` altında test dosyaları.

### Deployment
- [ ] **Docker**: `docker-compose up` ile tam çalışma.
- [ ] `docker/redis/` yapılandırması tamamlandı.
- [ ] **Seed**: Demo verileriyle sistemi doldur (`npm run seed`).
- [ ] **Dokümantasyon**: API dokümantasyonu (Swagger).

---

## Özet İstatistikler

| Kategori | Tamamlanan | Bekleyen | Toplam |
|----------|------------|----------|--------|
| Proje Yapısı | 8 | 0 | 8 |
| Altyapı | 8 | 12 | 20 |
| IAM | 2 | 8 | 10 |
| İdari Modüller | 0 | 5 | 5 |
| Proje Yönetimi | 0 | 10 | 10 |
| Finans | 0 | 12 | 12 |
| Bildirim/Audit | 0 | 5 | 5 |
| Altyapı Servisleri | 1 | 4 | 5 |
| Test/Deployment | 0 | 6 | 6 |
| **TOPLAM** | **19** | **62** | **81** |

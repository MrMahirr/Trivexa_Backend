# Trivexa Backend - Mimari Dokümantasyonu

Bu belge, Trivexa Backend projesinin **Clean Architecture** prensipleri doğrultusunda tasarlanmış dosya yapısını ve her bir bileşenin amacını detaylı olarak açıklamaktadır.

---

## 🏗️ Genel Mimari Bakış

```
┌─────────────────────────────────────────────────────────────────┐
│                        Controllers                               │
│                    (HTTP İstek/Yanıt)                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Application Layer                           │
│              (Use Cases, DTOs, Ports)                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Domain Layer                               │
│        (Entities, Value Objects, Business Rules)                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Infrastructure Layer                           │
│      (Database, Cache, Queue, External Services)                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Kök Dizin Dosyaları

| Dosya | Açıklama |
|-------|----------|
| `main.ts` | Uygulamanın giriş noktası. NestJS uygulamasını başlatır, global pipe'lar, CORS ve prefix ayarlarını yapar. |
| `app.module.ts` | Ana modül. Tüm alt modülleri, global provider'ları ve yapılandırmaları bir araya getirir. |
| `.env` | Ortam değişkenleri. Veritabanı bağlantısı, JWT secret, API anahtarları gibi hassas bilgileri içerir. |
| `package.json` | Proje bağımlılıkları ve npm script'leri. |
| `tsconfig.json` | TypeScript derleyici yapılandırması. |

---

## ⚙️ Config Klasörü (`src/config/`)

Tüm yapılandırma dosyalarını merkezi olarak barındırır. Her config dosyası, ilgili ayarları `process.env`'den okuyarak döndürür.

| Dosya | Amaç |
|-------|------|
| `env.config.ts` | Genel ortam ayarları (PORT, NODE_ENV, API_PREFIX) |
| `database.config.ts` | PostgreSQL bağlantı ayarları (host, port, user, password, database) |
| `redis.config.ts` | Redis bağlantı ayarları (cache ve rate limiting için) |
| `rate-limit.config.ts` | API rate limiting kuralları (pencere süresi, maksimum istek sayısı) |
| `cors.config.ts` | Cross-Origin Resource Sharing ayarları (izin verilen origin'ler, methodlar) |
| `feature-flags.config.ts` | Özellik bayrakları (modülleri açıp kapatmak için) |

---

## 🛡️ Common Klasörü (`src/common/`)

Uygulamanın tamamında kullanılan cross-cutting concern'leri içerir.

### Middlewares (`common/middlewares/`)

İstek pipeline'ının başında çalışan ara katmanlar.

| Dosya | Amaç |
|-------|------|
| `request-id.middleware.ts` | Her isteğe benzersiz bir UUID atar (loglama ve izleme için) |
| `request-ip.middleware.ts` | İstemci IP adresini çıkarır ve request'e ekler |
| `logger.middleware.ts` | Gelen istekleri loglar (method, URL, response time) |
| `payload-limit.middleware.ts` | İstek gövdesi boyutunu sınırlar (DoS koruması) |
| `cors.middleware.ts` | CORS politikalarını uygular |

### Guards (`common/guards/`)

Endpoint erişim kontrolü sağlayan korumalar.

| Dosya | Amaç |
|-------|------|
| `auth/jwt.guard.ts` | JWT token doğrulaması yapar, yetkisiz erişimi engeller |
| `auth/client-token.guard.ts` | Müşteri portalı için özel token doğrulaması |
| `rate-limit.guard.ts` | IP başına istek sayısını sınırlar |
| `force-password.guard.ts` | Şifre değişikliği zorunlu kullanıcıları yönlendirir |
| `roles.guard.ts` | Rol tabanlı erişim kontrolü (Admin, Manager, Employee) |
| `departments.guard.ts` | Departman tabanlı erişim kontrolü |
| `permissions.guard.ts` | Granüler izin kontrolü (USER_CREATE, PROJECT_VIEW vb.) |
| `tenant.guard.ts` | Multi-tenant senaryolar için kiracı ayırımı |
| `feature-flag.guard.ts` | Özellik bayraklarına göre endpoint erişimi |

### Interceptors (`common/interceptors/`)

Response dönüşümü ve cross-cutting işlemler.

| Dosya | Amaç |
|-------|------|
| `response.interceptor.ts` | Tüm başarılı yanıtları `{ success: true, data: ... }` formatına sarar |
| `timing.interceptor.ts` | İstek/yanıt süresini ölçer ve header'a ekler |
| `cache.interceptor.ts` | GET isteklerini Redis'te cache'ler |

### Filters (`common/filters/`)

Hata yakalama ve standartlaştırma.

| Dosya | Amaç |
|-------|------|
| `global-exception.filter.ts` | Tüm hataları yakalar, standart JSON formatında döndürür |

### Decorators (`common/decorators/`)

Controller ve handler'larda kullanılan özel dekoratörler.

| Dosya | Amaç |
|-------|------|
| `roles.decorator.ts` | `@Roles('admin', 'manager')` - Gerekli rolleri tanımlar |
| `permissions.decorator.ts` | `@Permissions(Permission.USER_CREATE)` - İzin gereksinimi |
| `departments.decorator.ts` | `@Departments('IT', 'HR')` - Departman kısıtlaması |
| `audit.decorator.ts` | `@Audit()` - İşlemi audit log'a kaydet |
| `public.decorator.ts` | `@Public()` - Auth gerektirmeyen endpoint işaretler |
| `feature.decorator.ts` | `@Feature('invoicing')` - Özellik bayrağı kontrolü |

### Pipes (`common/pipes/`)

Giriş verisi validasyonu ve dönüşümü.

| Dosya | Amaç |
|-------|------|
| `validation.pipe.ts` | class-validator ile DTO validasyonu |
| `sanitize.pipe.ts` | XSS koruması için girdi temizleme |

### Constants (`common/constants/`)

Sabit değerler ve enum'lar.

| Dosya | Amaç |
|-------|------|
| `error-codes.ts` | Standart hata kodları (E001, E002...) |
| `permissions.ts` | Sistem izinleri listesi |
| `roles.ts` | Kullanıcı rolleri |
| `departments.ts` | Departman tanımları |

---

## 📦 Application Layer (`src/application/`)

İş mantığını orkestre eden katman. Use Case'ler burada yaşar.

### Use Cases (`application/use-cases/`)

Her use case, tek bir iş senaryosunu gerçekleştirir.

```
use-cases/
├── auth/          # Login, Logout, Token Refresh
├── users/         # Create, Update, Delete User
├── projects/      # Project CRUD, Status Changes
├── invoices/      # Invoice Creation, Payment Recording
├── finance/       # Ledger Operations, Reports
└── audit/         # Audit Log Recording
```

**Örnek Use Case yapısı:**
```typescript
// create-user.usecase.ts
class CreateUserUseCase {
  execute(dto: CreateUserDto): Promise<User> {
    // 1. Validasyon
    // 2. Business rules kontrolü
    // 3. Repository çağrısı
    // 4. Sonuç döndürme
  }
}
```

### DTOs (`application/dto/`)

Data Transfer Objects - API request/response şekilleri.

| Klasör | Amaç |
|--------|------|
| `auth/` | Login, Register, Token DTO'ları |
| `users/` | User CRUD DTO'ları |
| `projects/` | Project DTO'ları |
| `invoices/` | Invoice DTO'ları |

### Ports (`application/ports/`)

Dependency Inversion için interface tanımları.

| Dosya | Amaç |
|-------|------|
| `repositories/user.repository.port.ts` | User repository interface |
| `repositories/project.repository.port.ts` | Project repository interface |
| `repositories/invoice.repository.port.ts` | Invoice repository interface |
| `audit.port.ts` | Audit log interface |

### Transaction (`application/transaction/`)

Veritabanı transaction yönetimi.

| Dosya | Amaç |
|-------|------|
| `transaction-manager.ts` | Transaction başlatma/commit/rollback |
| `transaction-context.ts` | Transaction context propagation |

---

## 🎯 Domain Layer (`src/domain/`)

İş kurallarının kalbi. Framework bağımsız, saf TypeScript.

### Entities (`domain/entities/`)

Domain nesneleri ve iş mantıkları.

| Dosya | Amaç |
|-------|------|
| `user.entity.ts` | Kullanıcı domain modeli (validatePassword, changeRole...) |
| `project.entity.ts` | Proje domain modeli (updateStatus, assignMember...) |
| `invoice.entity.ts` | Fatura domain modeli (calculateTotal, markAsPaid...) |
| `audit-log.entity.ts` | Denetim kaydı domain modeli |

### Value Objects (`domain/value-objects/`)

Değişmez (immutable) değer nesneleri.

| Dosya | Amaç |
|-------|------|
| `email.vo.ts` | Email validasyonu ve formatlaması |
| `money.vo.ts` | Para birimi ve hesaplama operasyonları |
| `uuid.vo.ts` | UUID validasyonu ve oluşturma |

### Rules (`domain/rules/`)

İş kuralları ve validasyonlar.

| Dosya | Amaç |
|-------|------|
| `invoice.rules.ts` | Fatura kuralları (örn: toplam > 0, vade tarihi gelecekte) |
| `project.rules.ts` | Proje kuralları (örn: başlangıç < bitiş tarihi) |
| `finance.rules.ts` | Finans kuralları (örn: debit = credit) |

### Errors (`domain/errors/`)

Domain spesifik hata sınıfları.

| Dosya | Amaç |
|-------|------|
| `domain-error.base.ts` | Tüm domain hatalarının base class'ı |
| `rule-violation.error.ts` | İş kuralı ihlali hatası |
| `permission.error.ts` | Yetki hatası |

---

## 🔧 Infrastructure Layer (`src/infrastructure/`)

Dış dünya ile iletişim: veritabanı, cache, queue, external API'ler.

### Database (`infrastructure/database/`)

PostgreSQL veritabanı operasyonları.

| Klasör/Dosya | Amaç |
|--------------|------|
| `pg/pool.ts` | Connection pool yönetimi |
| `pg/client.ts` | Database client wrapper |
| `pg/transaction.ts` | Transaction helpers |
| `repositories/` | Repository implementasyonları (Port'ları implemente eder) |
| `error-mapping/` | PostgreSQL hatalarını domain hatalarına çevirir |
| `migrations/` | Veritabanı şema değişiklikleri (SQL dosyaları) |

### Cache (`infrastructure/cache/`)

Redis önbellekleme.

| Dosya | Amaç |
|-------|------|
| `redis.client.ts` | Redis bağlantısı ve temel operasyonlar (get, set, del) |
| `rate-limit.store.ts` | Rate limiting sayaçları |

### Queue (`infrastructure/queue/`)

Asenkron iş kuyruğu (Bull/BullMQ).

| Dosya | Amaç |
|-------|------|
| `audit.producer.ts` | Audit log'ları kuyruğa gönderir |
| `audit.consumer.ts` | Kuyruktan audit log'ları işler |
| `dead-letter.queue.ts` | Başarısız işleri yönetir |

### Logging (`infrastructure/logging/`)

Loglama altyapısı.

| Dosya | Amaç |
|-------|------|
| `logger.service.ts` | Log seviyelerine göre loglama (debug, info, warn, error) |
| `logger.formatter.ts` | Log formatı (JSON, text) |

### Monitoring (`infrastructure/monitoring/`)

Sistem sağlığı ve izleme.

| Dosya | Amaç |
|-------|------|
| `sentry.service.ts` | Hata izleme ve raporlama |
| `health.controller.ts` | `/health`, `/health/ready`, `/health/live` endpoint'leri |

---

## 📚 Modules (`src/modules/`)

NestJS modül tanımları. Her modül ilgili provider, controller ve servisleri gruplar.

| Modül | Amaç |
|-------|------|
| `auth.module.ts` | Kimlik doğrulama (login, logout, token) |
| `users.module.ts` | Kullanıcı yönetimi |
| `projects.module.ts` | Proje yönetimi |
| `invoices.module.ts` | Fatura yönetimi |
| `finance.module.ts` | Finans ve muhasebe |
| `audit.module.ts` | Denetim kayıtları |

---

## 🎮 Controllers (`src/controllers/`)

HTTP endpoint'leri. İnce tutulur, sadece request/response handling yapar.

| Controller | Endpoint Prefix | Amaç |
|------------|-----------------|------|
| `auth.controller.ts` | `/auth` | Login, logout, token işlemleri |
| `users.controller.ts` | `/users` | User CRUD |
| `projects.controller.ts` | `/projects` | Project CRUD |
| `invoices.controller.ts` | `/invoices` | Invoice CRUD |
| `finance.controller.ts` | `/finance` | Finans raporları |

---

## 🧪 Test Klasörü (`test/`)

| Klasör | Amaç |
|--------|------|
| `unit/` | Birim testleri (entity, use case, service testleri) |
| `integration/` | Entegrasyon testleri (veritabanı ile birlikte) |
| `e2e/` | Uçtan uca testler (tam API akışları) |

---

## 🐳 Docker Klasörü (`docker/`)

| Klasör | Amaç |
|--------|------|
| `postgres/` | PostgreSQL Docker yapılandırması ve init script'leri |
| `redis/` | Redis Docker yapılandırması |
| `pgadmin/` | PgAdmin yönetim arayüzü yapılandırması |

---

## 📜 Scripts Klasörü (`scripts/`)

| Dosya | Amaç |
|-------|------|
| `seed.ts` | Veritabanını demo verilerle doldurur |
| `generate-permissions.ts` | İzinleri otomatik oluşturur |
| `maintenance/` | Bakım scriptleri (ay sonu kapanış, banka mutabakatı vb.) |

---

## 🔄 Veri Akışı

```
HTTP Request
    │
    ▼
┌─────────────────────┐
│    Middleware       │  ← Request ID, IP, Logging
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│      Guards         │  ← Auth, Rate Limit, Permissions
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│      Pipes          │  ← Validation, Sanitization
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│    Controller       │  ← HTTP handling
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│     Use Case        │  ← Business orchestration
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│    Domain Entity    │  ← Business rules
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│    Repository       │  ← Data persistence
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│   Interceptor       │  ← Response transformation
└─────────────────────┘
    │
    ▼
HTTP Response
```

---

## 📌 Önemli Prensipler

1. **Dependency Inversion**: Domain/Application katmanları infrastructure'a bağımlı değil
2. **Single Responsibility**: Her dosya tek bir sorumluluk taşır
3. **Port/Adapter Pattern**: Repository interface'leri application'da, implemente'ları infrastructure'da
4. **DTO Validation**: Tüm girişler pipe'larla valide edilir
5. **Consistent Error Handling**: Global exception filter ile standart hata formatı

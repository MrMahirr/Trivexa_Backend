# 🧠 Trivexa Backend — Detaylı Yol Haritası & Yapılacaklar

> **Oluşturulma**: 2026-02-13  
> **Toplam Tahmini Süre**: ~60-70 saat  
> **Mimari**: NestJS + Raw SQL (pg) + Redis + Clean Architecture

---

## 📊 Proje Mevcut Durum Özeti

| Bileşen | Durum | Not |
|:---|:---|:---|
| Docker + PostgreSQL | ✅ Çalışıyor | Port 2678, 18 SQL init script |
| NestJS Projesi | ⚠️ İskelet | `main.ts` minimal, modüller bağlanmamış |
| 13 Modül Klasörü | ⚠️ Boş Stub | Clean Architecture klasörleri var, kod yok |
| Common Katmanı | ⚠️ Kısmen | Sadece `GlobalExceptionFilter` basit impl. |
| Config Dosyaları | ⚠️ Kısmen | Sadece `redis.config.ts` dolu |
| `.env` Dosyası | ❌ Yok | Oluşturulmalı |
| Eksik Paketler | ❌ Yok | JWT, bcrypt, ioredis, helmet kurulmalı |
| TypeORM | ⚠️ Gereksiz | `package.json`'da var, kaldırılmalı |
| Dokümantasyon | ✅ Tamam | 40+ doküman + 4 Mermaid diyagram |

---

## 🗺️ Genel Yol Haritası (Faz Sırası)

```
FAZ 0: Temizlik & Paket Kurulumu ─────────────────────── [~1 saat]
    │
FAZ 1: Core Infrastructure ───────────────────────────── [~4-6 saat]
    │   ├── 1.1 Config Module
    │   ├── 1.2 Database Core (Pool + Transaction)
    │   ├── 1.3 Redis Client
    │   └── 1.4 Global Pipeline (main.ts + AppModule)
    │
FAZ 2: Authentication & RBAC ─────────────────────────── [~6-8 saat]
    │   ├── 2.1 Shared Enums
    │   ├── 2.2 Auth Module (Login/Refresh/Logout)
    │   └── 2.3 RBAC Guards & Decorators
    │
FAZ 3: Users & Clients Module ────────────────────────── [~6 saat]
    │   ├── 3.1 Users Module
    │   └── 3.2 Clients Module
    │
FAZ 4: Projects & Tasks Module ────────────────────────── [~8-10 saat]
    │   ├── 4.1 Projects Module
    │   └── 4.2 Tasks Module
    │
FAZ 5: Time Tracking & Tickets Module ─────────────────── [~6 saat]
    │   ├── 5.1 Time Tracking Module
    │   └── 5.2 Tickets Module
    │
FAZ 6: Finance & Accounting Module ────────────────────── [~10-12 saat]
    │   ├── 6.1 Invoices Sub-Module
    │   ├── 6.2 Payments Sub-Module
    │   └── 6.3 Expenses Sub-Module
    │
FAZ 7: Contracts, Meetings, Files ─────────────────────── [~6 saat]
    │   ├── 7.1 Contracts Module
    │   ├── 7.2 Meetings Module
    │   └── 7.3 Files Module
    │
FAZ 8: Notifications & Audit ──────────────────────────── [~4 saat]
    │   ├── 8.1 Notifications Module
    │   └── 8.2 Audit Module
    │
FAZ 9: Performance & Caching ──────────────────────────── [~4 saat]
    │
FAZ 10: Monitoring & Production Readiness ─────────────── [~4 saat]
```

---

# FAZ 0: Temizlik & Paket Kurulumu ✅
> 🔴 **Öncelik**: Critical | ⏱️ ~1 saat | 📌 Bağımlılık: Yok

### Adımlar

- [x] **0.1** TypeORM kaldır
  ```bash
  npm uninstall typeorm @nestjs/typeorm
  ```

- [x] **0.2** Auth paketleri kur
  ```bash
  npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
  npm install -D @types/passport-jwt @types/bcrypt
  ```

- [x] **0.3** Redis paketi kur
  ```bash
  npm install ioredis
  npm install -D @types/ioredis
  ```

- [x] **0.4** Güvenlik & Araç paketleri kur
  ```bash
  npm install helmet @nestjs/swagger uuid
  npm install -D @types/uuid
  ```

- [x] **0.5** `.env` dosyası oluştur
  - `APP_PORT`, `DB_*`, `REDIS_*`, `JWT_*`, `BCRYPT_SALT_ROUNDS`

- [x] **0.6** `.env.example` dosyası oluştur (şifresiz referans)

---

# FAZ 1: Core Infrastructure ✅
> 🔴 **Öncelik**: Critical | ⏱️ ~4-6 saat | 📌 Bağımlılık: FAZ 0

Her modülün ortak olarak kullandığı temel altyapı katmanı.

---

## 1.1 Config Module (`src/config/`)

Tüm environment değişkenlerini merkezi olarak yönetmek için.

- [x] **1.1.1** `app.config.ts`
  - `registerAs('app', ...)` ile NestJS ConfigModule'e bağla
  - Alanlar: `port`, `prefix`, `environment`, `name`

- [x] **1.1.2** `database.config.ts`
  - Alanlar: `host`, `port`, `name`, `user`, `password`, `poolMin`, `poolMax`
  - `pg.Pool` constructor'ına pass edilecek format

- [x] **1.1.3** `jwt.config.ts`
  - Alanlar: `accessSecret`, `refreshSecret`, `accessExpiration`, `refreshExpiration`

- [x] **1.1.4** `redis.config.ts` (güncelle)
  - `ioredis` formatına çevir
  - Alanlar: `host`, `port`, `password`, `db`

- [x] **1.1.5** `security.config.ts`
  - CORS origins listesi
  - Helmet ayarları

---

## 1.2 Database Core (`src/database/`)

Raw SQL kullanımı için bağlantı havuzu ve transaction yönetimi.

- [x] **1.2.1** `pool.ts` — Connection Pool
  - `pg.Pool` instance oluştur
  - `@Injectable()` NestJS provider olarak
  - `OnModuleInit` → bağlantı testi (`SELECT 1`)
  - `OnModuleDestroy` → pool.end()

- [x] **1.2.2** `transaction.ts` — Transaction Manager
  - `withTransaction(callback)` → BEGIN → callback(client) → COMMIT
  - Hata durumunda otomatik ROLLBACK
  - Client'ı callback'e enjekte et

- [x] **1.2.3** `query/base-query.ts` — SQL Execution Helper
  - Parametrized query execution
  - `queryOne<T>()` — tek satır döndür veya null
  - `queryMany<T>()` — dizi döndür
  - `execute()` — INSERT/UPDATE/DELETE (rowCount)

- [x] **1.2.4** `error-mapping/pg-error.mapper.ts`
  - PostgreSQL SQLSTATE kodlarını HTTP hatalarına çevir
  - `23505` → 409 Conflict (unique violation)
  - `23503` → 409/404 (foreign key violation)
  - `23502` → 400 (not null violation)
  - `23514` → 422 (check violation)
  - `57014` → 500 (query timeout)

---

## 1.3 Redis Client (`src/infrastructure/cache/`)

Cache, rate limiting ve session yönetimi için.

- [x] **1.3.1** `redis.client.ts` — Tam Implementasyon
  - `ioredis` ile bağlantı
  - `get(key)` → JSON parse ile
  - `set(key, value, ttl)` → JSON stringify ile
  - `del(key)` → silme
  - `exists(key)` → var mı kontrolü
  - `incr(key)` → sayaç artırma (rate limit)
  - `OnModuleInit` → bağlantı kurma
  - `OnModuleDestroy` → bağlantı kapatma

---

## 1.4 Global Pipeline (`main.ts` + `app.module.ts`)

Request/Response lifecycle'ı standardize etmek için.

- [x] **1.4.1** `main.ts` güncellemesi
  - `app.setGlobalPrefix('api/v1')`
  - `app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))`
  - `app.useGlobalFilters(new GlobalExceptionFilter())`
  - `app.useGlobalInterceptors(new ResponseInterceptor())`
  - `app.use(helmet())`
  - `app.enableCors({ origin: [...] })`
  - Port `.env`'den oku

- [x] **1.4.2** `app.module.ts` güncellemesi
  - `ConfigModule.forRoot({ isGlobal: true })`
  - `DatabaseModule`, `RedisModule` import
  - Tüm feature modülleri import (FAZ 2+ sonrası eklenir)

- [x] **1.4.3** `response.interceptor.ts`
  - Success envelope: `{ success: true, statusCode, data, timestamp, path }`
  - `requestId` ekleme

- [x] **1.4.4** `global-exception.filter.ts` (güncelle)
  - `errorCode` alanı ekle
  - `requestId` alanı ekle
  - Production'da stack trace gizle
  - PG hata mapper entegrasyonu

- [x] **PostgreSQL + Docker**
  - Schema (`docker/postgres/init/`)
  - [x] **Migration System** (node-pg-migrate) ve `migration_guide.md`
- [x] **Redis Setup**
- [x] **1.4.5** `logger.middleware.ts`
  - Request: method, URL, IP, requestId
  - Response: statusCode, duration (ms)

- [x] **1.4.6** `request-id.middleware.ts`
  - UUID v4 oluştur → `req.headers['x-request-id']`'e ata

---

# FAZ 2: Authentication & Authorization ✅
> 🔴 **Öncelik**: Critical | ⏱️ ~6-8 saat | 📌 Bağımlılık: FAZ 1

Sistemin güvenlik omurgası. Her korunan endpoint bu katmandan geçer.

---

## 2.1 Shared Enums (`src/shared/enums/`)

Tüm modüllerin ortak kullandığı sabitler.

- [x] **2.1.1** `role.enum.ts`
  - `ADMIN`, `MANAGER`, `MEMBER`, `VIEWER`, `CLIENT`

- [x] **2.1.2** `department.enum.ts`
  - `MANAGEMENT`, `DESIGN`, `DEVELOPMENT`, `MARKETING`, `FINANCE`, `HR`

- [x] **2.1.3** `permission.enum.ts`
  - Format: `KAYNAK_EYLEM` (örn: `USERS_READ`, `PROJECTS_DELETE`)
  - Her modül için: `READ`, `CREATE`, `UPDATE`, `DELETE`

---

## 2.2 Auth Module (`src/modules/auth/`)

JWT tabanlı kimlik doğrulama sistemi.

### Dosya Yapısı
```
auth/
├── api/
│   ├── auth.controller.ts      ← HTTP endpoint'ler
│   └── dto/
│       ├── login.dto.ts         ← Email + Password
│       ├── refresh-token.dto.ts ← refreshToken
│       └── change-password.dto.ts
├── application/
│   ├── auth.service.ts          ← İş mantığı
│   └── password.service.ts      ← bcrypt hash/compare
├── domain/
│   └── auth.errors.ts           ← Custom hatalar
├── infrastructure/
│   ├── jwt.strategy.ts          ← Passport JWT Strategy
│   └── refresh-token.repository.ts ← SQL queries
└── auth.module.ts
```

### Adımlar

- [x] **2.2.1** `login.dto.ts` — Validation
  - `email`: `@IsEmail()`, `@IsNotEmpty()`
  - `password`: `@IsString()`, `@MinLength(8)`

- [x] **2.2.2** `password.service.ts`
  - `hash(password)` → bcrypt ile
  - `compare(password, hash)` → doğrulama

- [x] **2.2.3** `refresh-token.repository.ts`
  - `create(userId, tokenHash, expiresAt)` → INSERT
  - `findByTokenHash(hash)` → SELECT
  - `revokeByUserId(userId)` → UPDATE revoked_at
  - `revokeByTokenHash(hash)` → UPDATE revoked_at

- [x] **2.2.4** `jwt.strategy.ts`
  - Passport `Strategy` extend
  - `validate(payload)` → `{ userId, email, role, department }`

- [x] **2.2.5** `auth.service.ts`
  - `login(email, password)`:
    1. User bul (email)
    2. Şifre doğrula (bcrypt)
    3. Access + Refresh token oluştur
    4. Refresh token DB'ye kaydet
    5. Token çifti döndür
  - `refresh(refreshToken)`:
    1. Token hash'le → DB'de bul
    2. Expire/revoke kontrolü
    3. Eski token'ı revoke et (rotation)
    4. Yeni token çifti üret
  - `logout(refreshToken)`:
    1. Token'ı revoke et
  - `changePassword(userId, oldPassword, newPassword)`:
    1. Eski şifreyi doğrula
    2. Yeni şifreyi hash'le
    3. DB'de güncelle
    4. `force_password_change = false`

- [x] **2.2.6** `auth.controller.ts`
  - `POST /auth/login` → Public
  - `POST /auth/refresh` → Public
  - `POST /auth/logout` → @UseGuards(JwtAuthGuard)
  - `POST /auth/change-password` → @UseGuards(JwtAuthGuard)

- [x] **2.2.7** `auth.module.ts`
  - PassportModule, JwtModule register
  - Provider'ları ve Controller'ı bağla

---

## 2.3 RBAC Guards & Decorators (`src/common/guards/` + `src/common/decorators/`)

3 katmanlı yetkilendirme sistemi: Role → Department → Permission

- [x] **2.3.1** `jwt-auth.guard.ts`
  - Passport `AuthGuard('jwt')` extend
  - Token yoksa 401, geçersizse 401

- [x] **2.3.2** `roles.guard.ts`
  - `@Roles('ADMIN', 'MANAGER')` decorator'ından izinli rolleri oku
  - `req.user.role` ile karşılaştır
  - Eşleşmezse 403

- [x] **2.3.3** `departments.guard.ts`
  - `@Departments('FINANCE')` decorator
  - `req.user.department` ile karşılaştır

- [x] **2.3.4** `permissions.guard.ts`
  - `@Permissions('PROJECTS_DELETE')` decorator
  - User permissions ile karşılaştır

- [x] **2.3.5** `force-password-change.guard.ts`
  - `req.user.force_password_change === true` ise
  - Sadece `/auth/change-password` route'una izin ver

- [x] **2.3.6** `rate-limit.guard.ts`
  - Redis `INCR` + `TTL` ile
  - Login: 5 req/min, Genel: 100 req/min

- [x] **2.3.7** Custom Decorators
  - `@CurrentUser()` → `req.user` döndür
  - `@Roles(...)`, `@Departments(...)`, `@Permissions(...)`
  - `@RequestId()` → `req.headers['x-request-id']`

---

# FAZ 3: Users & Clients Module ✅
> 🔴 **Öncelik**: Critical | ⏱️ ~6 saat | 📌 Bağımlılık: FAZ 2

---

## 3.1 Users Module (`src/modules/users/`)

### Dosya Yapısı
```
users/
├── api/
│   ├── users.controller.ts
│   └── dto/
│       ├── create-user.dto.ts
│       ├── update-user.dto.ts
│       └── user-query.dto.ts       ← Pagination + Filters
├── application/
│   ├── users.service.ts
│   └── interfaces/
│       └── user.repository.interface.ts
├── domain/
│   ├── user.entity.ts
│   └── user.errors.ts
├── infrastructure/
│   └── users.repository.ts         ← SQL Queries
└── users.module.ts
```

### Adımlar

- [x] **3.1.1** `user.entity.ts` — Domain Entity
  - `id`, `email`, `firstName`, `lastName`, `role`, `department`, `isActive`
  - Factory method: `User.create(dto)` → validasyonlu nesne

- [x] **3.1.2** `create-user.dto.ts` — Validation
  - `email`: `@IsEmail()`, required
  - `password`: `@MinLength(8)`, 1 büyük harf, 1 rakam
  - `firstName`, `lastName`: `@IsString()`, required
  - `role`: `@IsEnum(Role)`
  - `department`: `@IsEnum(Department)`

- [x] **3.1.3** `users.repository.ts` — SQL Queries
  - `findAll(query)` → pagination + filter (role, department, isActive)
  - `findById(id)` → tek kullanıcı
  - `findByEmail(email)` → login için
  - `create(data)` → INSERT RETURNING *
  - `update(id, data)` → UPDATE RETURNING *
  - `deactivate(id)` → `is_active = false`
  - `updatePassword(id, hash)` → şifre güncelleme

- [x] **3.1.4** `users.service.ts` — İş Mantığı
  - Email uniqueness kontrolü (create'de)
  - Password hash (create'de)
  - Self-update kuralı (role değiştiremez)
  - Deactivation: aktif projeleri varsa uyar

- [x] **3.1.5** `users.controller.ts` — Endpoints
  - `GET /users` → `@Roles('ADMIN', 'MANAGER')`
  - `GET /users/me` → `@UseGuards(JwtAuthGuard)` (kendi profili)
  - `GET /users/:id` → `@Roles('ADMIN', 'MANAGER')` veya self
  - `POST /users` → `@Roles('ADMIN')`
  - `PUT /users/:id` → `@Roles('ADMIN')` veya self
  - `PATCH /users/:id/deactivate` → `@Roles('ADMIN')`

- [x] **3.1.6** `users.module.ts` — Module tanımı

---

## 3.2 Clients Module (`src/modules/clients/`)

### Dosya Yapısı
```
clients/
├── api/
│   ├── clients.controller.ts
│   └── dto/
│       ├── create-client.dto.ts
│       └── update-client.dto.ts
├── application/
│   └── clients.service.ts
├── domain/
│   └── client.entity.ts
├── infrastructure/
│   └── clients.repository.ts
└── clients.module.ts
```

### Adımlar

- [x] **3.2.1** `client.entity.ts`
  - `id`, `companyName`, `contactPerson`, `email`, `phone`, `address`, `isActive`

- [x] **3.2.2** `create-client.dto.ts`
  - `companyName`: required
  - `contactPerson`: required
  - `email`: `@IsEmail()`, required
  - `phone`: `@IsOptional()`

- [x] **3.2.3** `clients.repository.ts`
  - CRUD SQL queries
  - `findByCompanyName(name)` → arama

- [x] **3.2.4** `clients.service.ts`
  - Email/company uniqueness
  - Client'a bağlı projeler → soft delete

- [x] **3.2.5** `clients.controller.ts`
  - `GET /clients` → `@Roles('ADMIN', 'MANAGER')`
  - `POST /clients` → `@Roles('ADMIN', 'MANAGER')`
  - `GET /clients/:id` → `@Roles('ADMIN', 'MANAGER')`
  - `PUT /clients/:id` → `@Roles('ADMIN', 'MANAGER')`

- [x] **3.2.6** `clients.module.ts`

---

# FAZ 4: Projects & Tasks Module ✅
> 🟠 **Öncelik**: High | ⏱️ ~8-10 saat | 📌 Bağımlılık: FAZ 3

---

## 4.1 Projects Module (`src/modules/projects/`)

### Dosya Yapısı
```
projects/
├── api/
│   ├── projects.controller.ts
│   └── dto/
│       ├── create-project.dto.ts
│       ├── update-project.dto.ts
│       ├── add-member.dto.ts
│       └── project-query.dto.ts
├── application/
│   └── projects.service.ts
├── domain/
│   ├── project.entity.ts
│   └── project.rules.ts            ← İş kuralları
├── infrastructure/
│   ├── projects.repository.ts
│   └── project-members.repository.ts
└── projects.module.ts
```

### Adımlar

- [x] **4.1.1** `project.entity.ts`
  - `id`, `name`, `clientId`, `status`, `budget`, `startDate`, `deadline`, `createdBy`

- [x] **4.1.2** `project.rules.ts` — Domain Rules
  - `canChangeStatus(from, to)` → geçerli status geçişleri
  - `canAddMember(project, user)` → proje aktif mi?
  - `canArchive(project)` → açık task var mı?

- [x] **4.1.3** `create-project.dto.ts`
  - `name`: required
  - `clientId`: `@IsUUID()`, required
  - `budget`: `@IsNumber()`, `@Min(0)`, optional
  - `deadline`: `@IsDateString()`, optional

- [x] **4.1.4** `projects.repository.ts`
  - `findAll(userId, query)` → role-based: ADMIN tümü, MEMBER sadece kendinin
  - `findById(id)` → JOIN members, milestones
  - `create(data, client)` → **Transaction** (project + creator as member)
  - `updateStatus(id, status)` → UPDATE
  - `addMember(projectId, userId, role)` → INSERT project_members
  - `removeMember(projectId, userId)` → DELETE

- [x] **4.1.5** `projects.service.ts`
  - Client var mı kontrolü (FK)
  - Status geçiş validasyonu (domain rule)
  - Üye ekleme/çıkarma
  - Project metrics (task sayısı, tamamlanma yüzdesi)

- [x] **4.1.6** `projects.controller.ts`
  - `POST /projects` → `@Roles('ADMIN', 'MANAGER')`
  - `GET /projects` → Authenticated (filtered by role)
  - `GET /projects/:id` → Project Member
  - `PUT /projects/:id` → `@Roles('ADMIN', 'MANAGER')`
  - `PATCH /projects/:id/status` → `@Roles('ADMIN', 'MANAGER')`
  - `POST /projects/:id/members` → `@Roles('ADMIN', 'MANAGER')`
  - `DELETE /projects/:id/members/:userId` → `@Roles('ADMIN', 'MANAGER')`

- [x] **4.1.7** `projects.module.ts`

---

## 4.2 Tasks Module (Project Tasks)

### Adımlar

- [x] **4.2.1** `task.entity.ts`
  - `id`, `projectId`, `title`, `description`, `status`, `priority`, `assigneeId`, `dueDate`

- [x] **4.2.2** `task.rules.ts`
  - `canChangeStatus(task)` → blocker'lar tamamlanmış mı?
  - `canAssign(project, user)` → user proje üyesi mi?

- [x] **4.2.3** `tasks.repository.ts`
  - `findByProject(projectId, filters)` → status, assignee, priority filter
  - `create(data, client)` → INSERT
  - `updateStatus(id, status)` → domain rule check sonrası
  - `findBlockers(taskId)` → bağımlılık sorgula

- [x] **4.2.4** `tasks.service.ts`
  - Proje aktif mi kontrolü
  - Blocker dependency check
  - Assignee proje üyesi mi kontrolü

- [x] **4.2.5** `tasks.controller.ts`
  - `POST /projects/:pid/tasks` → `@Roles('MANAGER')` veya project member
  - `GET /projects/:pid/tasks` → Project Member
  - `PUT /tasks/:id` → Assigned User veya MANAGER
  - `PATCH /tasks/:id/status` → Assigned User veya MANAGER

- [x] **4.2.6** Module tanımı + testler

---

# FAZ 5: Time Tracking & Tickets Module ✅
> 🟠 **Öncelik**: High | ⏱️ ~6 saat | 📌 Bağımlılık: FAZ 4

---

## 5.1 Time Tracking Module (`src/modules/time-tracking/`)

### Adımlar

- [x] **5.1.1** `time-entry.entity.ts`
  - `id`, `userId`, `projectId`, `taskId`, `startTime`, `endTime`, `duration`, `description`, `approved`

- [x] **5.1.2** `time-entries.repository.ts`
  - `findActiveTimer(userId)` → SELECT WHERE end_time IS NULL
  - `start(userId, projectId, taskId)` → INSERT
  - `stop(id, endTime)` → UPDATE + duration hesapla
  - `findByUser(userId, dateRange)` → tarih aralığı filter
  - `approve(id, managerId)` → UPDATE approved = true

- [x] **5.1.3** `time-tracking.service.ts`
  - Aktif timer kontrolü (sadece 1 olabilir)
  - Duration hesaplama (`stop - start`)
  - Onaylanmış entry düzenlenemez

- [x] **5.1.4** `time-tracking.controller.ts`
  - `POST /time-entries/start` → Authenticated
  - `PATCH /time-entries/:id/stop` → Owner
  - `POST /time-entries` → Authenticated (manuel giriş)
  - `GET /time-entries` → Authenticated (kendi)
  - `PATCH /time-entries/:id/approve` → `@Roles('MANAGER')`

- [x] **5.1.5** Module tanımı

---

## 5.2 Tickets Module (`src/modules/tickets/`)

### Adımlar

- [x] **5.2.1** `ticket.entity.ts` + DTOs
  - `id`, `subject`, `description`, `type`, `status`, `priority`, `createdBy`, `assignedTo`

- [x] **5.2.2** `tickets.repository.ts`
  - CRUD + assignment + status transitions

- [x] **5.2.3** `tickets.service.ts`
  - Status geçiş kuralları (OPEN → IN_PROGRESS → RESOLVED → CLOSED)
  - Atama mantığı

- [x] **5.2.4** `tickets.controller.ts`
  - `POST /tickets` → Authenticated
  - `GET /tickets` → Authenticated (filtered by role)
  - `PATCH /tickets/:id/assign` → `@Roles('MANAGER')`
  - `PATCH /tickets/:id/status` → Assigned User veya MANAGER

- [x] **5.2.5** Module tanımı

---

# FAZ 6: Finance & Accounting Module ✅
> 🟠 **Öncelik**: High | ⏱️ ~10-12 saat | 📌 Bağımlılık: FAZ 3, FAZ 5

En kompleks modül. Çift taraflı muhasebe (double-entry ledger) sistemi.

---

## 6.1 Invoices Sub-Module

### Adımlar

- [x] **6.1.1** `invoice.entity.ts`
  - `id`, `invoiceNumber`, `clientId`, `projectId`, `status`, `subtotal`, `taxRate`, `total`, `dueDate`

- [x] **6.1.2** `invoice-item.entity.ts`
  - `id`, `invoiceId`, `description`, `quantity`, `unitPrice`, `total`

- [x] **6.1.3** `invoices.repository.ts`
  - `create(invoice, items, client)` → **Transaction**
    - INSERT invoice
    - INSERT N invoice_items
    - INSERT ledger_entries (DEBIT accounts_receivable)
  - `findAll(filters)` → client, status, date range
  - `findById(id)` → JOIN items
  - `updateStatus(id, status)` → DRAFT → SENT → PAID → CANCELLED

- [x] **6.1.4** `invoices.service.ts`
  - İnvoice numarası otomatik oluştur (`INV-2026-0001`)
  - Subtotal, tax, total otomatik hesapla
  - Gönderilmiş fatura silinemez (immutability)
  - İptal → ledger reversal entry

- [x] **6.1.5** `invoices.controller.ts`
  - `POST /invoices` → `@Roles('ADMIN')` + `@Departments('FINANCE')`
  - `GET /invoices` → `@Roles('ADMIN', 'MANAGER')` + `@Departments('FINANCE')`
  - `GET /invoices/:id` → yetki kontrolü
  - `POST /invoices/:id/send` → status → SENT

---

## 6.2 Payments Sub-Module

### Adımlar

- [x] **6.2.1** `payments.repository.ts`
  - `recordPayment(invoiceId, amount, method, client)` → **Transaction**
    - INSERT payment
    - INSERT ledger_entry (CREDIT accounts_receivable)
    - UPDATE invoice remaining_amount
    - Tam ödendiyse status → PAID

- [x] **6.2.2** `payments.service.ts`
  - Ödeme tutarı > kalan tutar kontrolü
  - Kısmi ödeme desteği
  - Currency tutarlılığı

- [x] **6.2.3** `payments.controller.ts`
  - `POST /invoices/:id/payments` → `@Departments('FINANCE')`

---

## 6.3 Expenses Sub-Module

### Adımlar

- [x] **6.3.1** `expenses.repository.ts`
  - CRUD + approval flow
  - `findByDepartment(dept)` → departman bazlı izolasyon

- [x] **6.3.2** `expenses.service.ts`
  - Onay akışı: DRAFT → PENDING → APPROVED → REJECTED
  - Onaylanan gider → ledger_entry (DEBIT expense)

- [x] **6.3.3** `expenses.controller.ts`
  - `POST /expenses` → Authenticated
  - `GET /expenses` → Filtered by department
  - `PATCH /expenses/:id/approve` → `@Roles('MANAGER')` + `@Departments('FINANCE')`

- [x] **6.3.4** Module tanımı (tüm accounting alt modülleri)

---

# FAZ 7: Contracts, Meetings, Files ✅
> 🟡 **Öncelik**: Medium | ⏱️ ~6 saat | 📌 Bağımlılık: FAZ 3

---

## 7.1 Contracts Module

- [x] **7.1.1** Entity + DTOs
  - `id`, `clientId`, `title`, `content`, `status`, `startDate`, `endDate`, `value`
  - Status: `DRAFT → PENDING_APPROVAL → APPROVED → SIGNED → EXPIRED`

- [x] **7.1.2** Repository (CRUD + status transitions)

- [x] **7.1.3** Service (onay akışı, süre kontrolü)

- [x] **7.1.4** Controller
  - `POST /contracts` → `@Roles('ADMIN', 'MANAGER')`
  - `PATCH /contracts/:id/approve` → `@Roles('ADMIN')`
  - `PATCH /contracts/:id/sign` → `@Roles('ADMIN')`

- [x] **7.1.5** Module tanımı

---

## 7.2 Meetings Module

- [x] **7.2.1** Entity + DTOs
  - `id`, `title`, `description`, `startTime`, `endTime`, `location`, `organizerId`

- [x] **7.2.2** Repository + Participants (many-to-many)

- [x] **7.2.3** Service + Controller

- [x] **7.2.4** Module tanımı

---

## 7.3 Files Module

- [x] **7.3.1** Entity
  - `id`, `fileName`, `filePath`, `mimeType`, `size`, `entityType`, `entityId`, `uploadedBy`
  - Polimorfik: `entityType = 'project' | 'contract' | 'ticket'`

- [x] **7.3.2** Repository + Service (S3 entegrasyonu gelecekte)

- [x] **7.3.3** Controller (upload/download placeholder)

- [x] **7.3.4** Module tanımı

---

# FAZ 8: Notifications & Audit
> 🟡 **Öncelik**: Medium | ⏱️ ~4 saat | 📌 Bağımlılık: FAZ 2

---

## 8.1 Notifications Module

- [ ] **8.1.1** Entity + DTOs
  - `id`, `userId`, `type`, `title`, `message`, `isRead`, `metadata`

- [ ] **8.1.2** Repository
  - `create(notification)` → INSERT
  - `findByUser(userId)` → unread first
  - `markAsRead(id)` → UPDATE
  - `markAllAsRead(userId)` → UPDATE WHERE

- [ ] **8.1.3** Service
  - Sistematik event'lerde notification oluştur
  - (Gelecek) WebSocket push, email

- [ ] **8.1.4** Controller
  - `GET /notifications` → Authenticated (kendi)
  - `PATCH /notifications/:id/read` → Owner
  - `PATCH /notifications/read-all` → Owner

- [ ] **8.1.5** Module tanımı

---

## 8.2 Audit Module

- [ ] **8.2.1** `audit.interceptor.ts` (güncelle)
  - `@Audit()` decorator ile işaretlenen endpoint'lerde
  - `old_data` vs `new_data` karşılaştırma
  - `audit_logs` tablosuna INSERT

- [ ] **8.2.2** `audit.repository.ts`
  - `create(log)` → INSERT (sync veya async queue)
  - `findByEntity(tableName, recordId)` → değişiklik geçmişi

- [ ] **8.2.3** `audit.service.ts`
  - Kritik işlemler → sync (aynı transaction)
  - Non-kritik işlemler → async (Redis queue)

- [ ] **8.2.4** Module tanımı

---

# FAZ 9: Performance & Caching
> 🟡 **Öncelik**: Medium | ⏱️ ~4 saat | 📌 Bağımlılık: FAZ 1-6

- [ ] **9.1** Query Cache Stratejisi
  - Permissions → Redis, TTL 5 dk
  - Project list → Redis, TTL 2 dk
  - Cache invalidation on mutation

- [ ] **9.2** Pagination Helpers
  - `offset-based`: basit listeler için
  - `cursor-based`: büyük veri setleri için

- [ ] **9.3** Connection Pool Tuning
  - Dev: `min:2, max:10`
  - Prod: `min:5, max:20`
  - Idle timeout: 30s

- [ ] **9.4** N+1 Prevention
  - JOIN-based queries (tek sorguda ilişkili veriler)
  - Batch loading where applicable

- [ ] **9.5** Response Compression
  - `compression` middleware (gzip)

- [ ] **9.6** Database Indexing Review
  - Composite index'ler kritik tablolara
  - `EXPLAIN ANALYZE` ile query plan kontrolü

---

# FAZ 10: Monitoring & Production Readiness
> 🟢 **Öncelik**: Low (şimdilik) | ⏱️ ~4 saat | 📌 Bağımlılık: FAZ 1-8

- [ ] **10.1** Health Check Endpoint
  - `GET /health` → DB ping + Redis ping
  - Response: `{ status: 'ok', db: 'connected', redis: 'connected' }`

- [ ] **10.2** Swagger UI
  - `@ApiTags`, `@ApiOperation`, `@ApiResponse` decorators
  - `GET /api/docs` → Swagger UI

- [ ] **10.3** Structured Logging
  - Winston veya Pino
  - JSON format, request correlation ID

- [ ] **10.4** Dockerfile
  - Multi-stage build: builder → runner
  - Alpine-based, minimal image size

- [ ] **10.5** Docker Compose Güncelleme
  - Redis servisi ekle
  - Network configuration
  - Health checks

- [ ] **10.6** Environment Validation
  - class-validator ile `.env` doğrulama
  - Eksik değişken → uygulama başlamasın

- [ ] **10.7** Error Tracking
  - Sentry entegrasyonu (opsiyonel)
  - 5xx hataları alert

---

# 📊 Özet Tablo

| Faz | Konu | Öncelik | Tahmini Süre | Bağımlılık |
|:---|:---|:---|:---|:---|
| **FAZ 0** | Temizlik & Paketler | 🔴 Critical | ~1 saat | — |
| **FAZ 1** | Core Infrastructure | 🔴 Critical | ~4-6 saat | FAZ 0 |
| **FAZ 2** | Auth & RBAC | 🔴 Critical | ~6-8 saat | FAZ 1 |
| **FAZ 3** | Users & Clients | 🔴 Critical | ~6 saat | FAZ 2 |
| **FAZ 4** | Projects & Tasks | 🟠 High | ~8-10 saat | FAZ 3 |
| **FAZ 5** | Time Tracking & Tickets | 🟠 High | ~6 saat | FAZ 4 |
| **FAZ 6** | Finance & Accounting | 🟠 High | ~10-12 saat | FAZ 3, 5 |
| **FAZ 7** | Contracts, Meetings, Files | 🟡 Medium | ~6 saat | FAZ 3 |
| **FAZ 8** | Notifications & Audit | 🟡 Medium | ~4 saat | FAZ 2 |
| **FAZ 9** | Performance & Caching | 🟡 Medium | ~4 saat | FAZ 1-6 |
| **FAZ 10** | Monitoring & Production | 🟢 Low | ~4 saat | FAZ 1-8 |

> **İlk Sprint Hedefi (FAZ 0-2)**: TypeORM kaldır → Paketleri kur → `.env` oluştur → DB Pool → Redis → Global Pipeline → Auth → RBAC  
> **Sprint sonunda**: Çalışan bir login/register sistemi + korunan endpoint'ler

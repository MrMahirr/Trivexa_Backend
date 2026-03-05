# Trivexa Backend - Proje Mimarisi

## 1. Genel Bakış ve Teknoloji Yığını

- **Çerçeve (Framework):** NestJS (v11)
- **Dil:** TypeScript
- **Veritabanı:** PostgreSQL (node-pg-migrate ile migration, saf SQL `pg` kütüphanesi ile sorgu yönetimi, ORM kullanılmamış)
- **Önbellek & Kuyruk:** Redis (ioredis, cache-manager)
- **Kimlik Doğrulama:** JWT, Passport
- **Gerçek Zamanlı İletişim:** Socket.io (WebSocket)
- **Dokümantasyon:** Swagger / OpenAPI
- **Test:** Jest, Supertest, Testcontainers

## 2. Mimari Yaklaşım (Clean Architecture & DDD)

Proje, **Clean Architecture** (Temiz Mimari) ve **Domain-Driven Design (DDD)** prensiplerine uygun olarak modüler bir yapıda tasarlanmıştır. Veritabanı erişimi ORM araçları yerine Repository design pattern ve saf/ham SQL dosyaları (`.sql.ts`) ile sağlanmaktadır.

Her iş alanı (domain) `src/modules` altında kendi modülü içinde kapsüllenmiştir. İki modül arası iletişim (Örneğin Auth'un User'a erişimi) sadece `public/` servisleri kullanılarak gerçekleştirilir.

### Modül İçi Standart Klasör Yapısı

- **`api/` (Sunum Katmanı):** HTTP Controller'lar, REST endpoint'leri ve DTO (Data Transfer Object) sınıfları.
- **`application/` (Uygulama Katmanı):** İş süreçlerini yöneten Use-Case sınıfları ve servisler. (Örn. `create-user.usecase.ts`)
- **`domain/` (Etki Alanı Katmanı):** İş kuralları (Rules), varlıklar (Entities), değer nesneleri (Value Objects) ve modüle özel hata tipleri (Errors). Veritabanından ve framework'ten tamamen bağımsızdır.
- **`infrastructure/` (Altyapı Katmanı):** Veritabanı işlemleri (Repository implementation), harici servis entegrasyonları ve modüle özel SQL dosyaları (`.sql.ts`).
- **`public/` (Açık Katman):** Sistem içi diğer modüllerin kullanabileceği fonksiyonları dışa açan arayüz servisidir (Örn: `users-public.service.ts`).
- **`transport/` (Opsiyonel):** WebSocket Gateway'leri veya Message Queue tüketici/üreticileri servisleri (Örn: notifications.gateway.ts).

## 3. Sistem Modülleri (`src/modules/`)

Ajans ve Freelance süreçlerini otomatize etmek amacıyla tasarlanan temel modüller:

- **`auth`:** JWT tabanlı kimlik doğrulama, token yenileme (refresh token), şifre değiştirme/sıfırlama.
- **`users`:** Sistem personeli/kullanıcıları yönetimi.
- **`roles` & `departments`:** Dinamik Yetkilendirme (RBAC) ve departman aidiyeti (Örn. Teknik, Finans vb.).
- **`clients`:** Müşteri/Firma yönetimi ve müşteri kullanıcılarının (Client Portal) sisteme dahil edilmesi. (Magic Link girişi desteklenir).
- **`projects`:** Müşterilere ait aktif projeler ve proje takımlarının (member) atanması.
- **`tasks`:** Projelere bağlı iş kalemlerinin oluşturulması ve takibi.
- **`time-tracking`:** Proje ve görevlere ayrılan zamanların ölçülmesi (Zamanlayıcı başlat/durdur).
- **`tickets`:** Müşterilerden veya sistem içinden gelen destek/talep bildirimleri.
- **`meetings`:** Toplantı notları, kararlar ve bunların ticket'a dönüştürülmesi.
- **`contracts`:** Sözleşme yönetimi ve süresi biten sözleşmelerin takibi.
- **`finance (Muhasebe)`:** Çok katmanlı finans ve ön muhasebe modülü. Altında `expenses`, `invoices`, `ledger`, `payments` bulunur.
- **`reports`:** Finansal özet, gösterge panosu (dashboard) ve analitik raporların oluşturulması.
- **`notifications`:** WebSockets aracılığıyla kullanıcı paneline anlık ve kalıcı bildirimlerin iletilmesi.
- **`audit`:** Sistemin tüm kritik süreçlerinin asenkron olarak loglanması (Audit Trail).
- **`presence`:** Anlık çevrimiçi/aktif kullanıcı (WebSocket) takibi.

## 4. Altyapı ve Çekirdek (Core) Bileşenler

- **Konfigürasyon (`src/config/`):** Uygulama ayarları tip güvenli (type-safe) bir şekilde `@nestjs/config` üzerinden çevresel (`.env`) değişkenler ile yönetilir.
- **Veritabanı (`src/database/`):** `pg` paketi üzerinden Database Pool ve Transaction yönetimi (`transaction-manager`) merkezileştirilmiştir. Migration'lar SQL formatında `database/migrations` altında yer alır.
- **Filtreleme ve Sayfalama:** Saf SQL için `pagination.sql.ts` ve `filters.sql.ts` kullanılarak standart, SQL injection korumalı pagination desteklenir.
- **Hata Yönetimi (Exception Handling):** `global-exception.filter.ts` ile tüm beklenmeyen veya öngörülen (domain) hataları tutarlı yapısal bir API JSON response olarak şekillendirilir.

## 5. Güvenlik ve Mimari Prensipler

1. **İzolasyon (Tenant/Client):** Müşteri verileri ID eşleştirmeleriyle korunur, farklı firmaların birbirlerinin verilerine erişimi `client-token.guard.ts` ve `@ClientUser()` dekoratörleriyle izole edilmiştir.
2. **Transaction Güvenliği:** Kompleks işlemler (Örn: Fatura kesme + Cari kayıt + Bildirim) `Transaction Context` üzerinde çalışır, hata durumunda tamamen geri alınır (Rollback).
3. **Idempotency (Durumsallık):** Aynı işlem için art arda istekleri (Örn: Mükerrer ödeme çekimi) engellemek adına önbellek tabanlı Idempotency Guard uygulanabilir.
4. **Rate Limit:** `@nestjs/throttler` ve Redis tabanlı eşzamanlı limitlerle DDos & Spam ataklarına karşı koruma sağlar.
5. **Dökümantasyon (Swagger):** Tüm API Endpointleri, Request/Response payload'larıyla birlikte dökümante edilmiştir. `@nestjs/swagger` kullanılmaktadır.

## 6. Tam Proje Klasör Ağacı

<details>
<summary>Detaylı klasör ve dosya hiyerarşisini görüntülemek için tıklayın</summary>

```text
trivexa_backend/
├── .github/
│   └── workflows/
│       └── ci.yml
├── docker/
│   ├── pgadmin/
│   ├── postgres/
│   │   └── init/
│   │       ├── 001_extensions.sql
│   │       ├── 010_helper_functions.sql
│   │       ├── 020_core_users.sql
│   │       ├── 030_auth_security.sql
│   │       ├── 040_clients.sql
│   │       ├── 050_client_portal.sql
│   │       ├── 060_projects.sql
│   │       ├── 070_project_tasks.sql
│   │       ├── 080_time_tracking.sql
│   │       ├── 085_tickets.sql
│   │       ├── 090_invoicing.sql
│   │       ├── 100_payments_ledger.sql
│   │       ├── 110_expenses.sql
│   │       ├── 120_contracts.sql
│   │       ├── 130_meetings.sql
│   │       ├── 140_notifications.sql
│   │       ├── 150_files.sql
│   │       ├── 160_audit_system_logs.sql
│   │       ├── 170_performance_indexes.sql
│   │       └── 900_seed_data.sql
│   ├── redis/
│   │   └── README.md
│   └── entrypoint.sh
├── docs/
│   ├── api/
│   │   ├── endpoints/
│   │   │   ├── audit.md
│   │   │   ├── auth.md
│   │   │   ├── client-portal.md
│   │   │   ├── clients.md
│   │   │   ├── contracts.md
│   │   │   ├── departments.md
│   │   │   ├── expenses.md
│   │   │   ├── files.md
│   │   │   ├── health.md
│   │   │   ├── invoices.md
│   │   │   ├── meetings.md
│   │   │   ├── notifications.md
│   │   │   ├── payments.md
│   │   │   ├── presence-websocket.md
│   │   │   ├── projects.md
│   │   │   ├── reports.md
│   │   │   ├── roles.md
│   │   │   ├── tasks.md
│   │   │   ├── tickets.md
│   │   │   ├── time-tracking.md
│   │   │   └── users.md
│   │   ├── authentication.md
│   │   ├── authorization.md
│   │   ├── error-codes.md
│   │   ├── filtering-sorting.md
│   │   ├── openapi.yaml
│   │   ├── pagination.md
│   │   ├── rate-limiting.md
│   │   ├── versioning.md
│   │   └── webhooks.md
│   ├── architecture/
│   │   ├── diagrams/
│   │   │   ├── Diagrams/
│   │   │   │   ├── 1. ANA REQUEST PIPELINE (Müşteri İçin Basit).mmd
│   │   │   │   ├── 10. USERS - Deactivation.mmd
│   │   │   │   ├── 11. CLIENTS - Client Registration.mmd
│   │   │   │   ├── 12. CLIENTS - Client User Creation & Portal Access.mmd
│   │   │   │   ├── 13. CLIENTS - Magic Link Login Flow.mmd
│   │   │   │   ├── 14. PROJECTS - Project Creation.mmd
│   │   │   │   ├── 15. PROJECTS - Status Update Flow.mmd
│   │   │   │   ├── 16. PROJECTS - Team Assignment Flow.mmd
│   │   │   │   ├── 17. TIME TRACKING - Start Timer.mmd
│   │   │   │   ├── 18. TIME TRACKING - Stop Timer.mmd
│   │   │   │   ├── 19. TIME TRACKING - Manual Entry Creation.mmd
│   │   │   │   ├── 2. ANA REQUEST PIPELINE (Süper Detaylı - Teknik Ekip İçin).mmd
│   │   │   │   ├── 20. TICKETS - Ticket Creation.mmd
│   │   │   │   ├── 21. TICKETS - Status Update Flow.mmd
│   │   │   │   ├── 22. TICKETS - Assignment Flow.mmd
│   │   │   │   ├── 23. CONTRACTS - Contract Creation.mmd
│   │   │   │   ├── 24. CONTRACTS - Approval Flow.mmd
│   │   │   │   ├── 25. FINANCE - Invoice Creation.mmd
│   │   │   │   ├── 26. FINANCE - Payment Recording (Detaylı).mmd
│   │   │   │   ├── 27. FINANCE - Expense Approval.mmd
│   │   │   │   ├── 28. NOTIFICATIONS - Creation & Delivery Flow.mmd
│   │   │   │   ├── 29. AUDIT - Sync vs Async Logging Strategies.mmd
│   │   │   │   ├── 3. AUTH - Login Flow.mmd
│   │   │   │   ├── 30. TRANSACTION MANAGEMENT - İç Yapısı (Detaylı).mmd
│   │   │   │   ├── 31. END-TO-END - Client Onboarding to First Invoice.mmd
│   │   │   │   ├── 32. END-TO-END - Ticket to Payment Flow.mmd
│   │   │   │   ├── 33. PRESENCE - WebSocket Room Join.mmd
│   │   │   │   ├── 4. AUTH - Refresh Token Flow.mmd
│   │   │   │   ├── 5. AUTH - Logout Flow.mmd
│   │   │   │   ├── 6. RBAC - 3 Katmanlı Yetkilendirme.mmd
│   │   │   │   ├── 7. USERS - User Registration.mmd
│   │   │   │   ├── 8. USERS - Profile Update.mmd
│   │   │   │   └── 9. USERS - Role Change.mmd
│   │   │   ├── pdf/
│   │   │   │   ├── Diagrams/
│   │   │   │   │   ├── 1. ANA REQUEST PIPELINE (Müşteri İçin Basit).pdf
│   │   │   │   │   ├── 10. USERS - Deactivation.pdf
│   │   │   │   │   ├── 11. CLIENTS - Client Registration.pdf
│   │   │   │   │   ├── 12. CLIENTS - Client User Creation & Portal Access.pdf
│   │   │   │   │   ├── 13. CLIENTS - Magic Link Login Flow.pdf
│   │   │   │   │   ├── 14. PROJECTS - Project Creation.pdf
│   │   │   │   │   ├── 15. PROJECTS - Status Update Flow.pdf
│   │   │   │   │   ├── 16. PROJECTS - Team Assignment Flow.pdf
│   │   │   │   │   ├── 17. TIME TRACKING - Start Timer.pdf
│   │   │   │   │   ├── 18. TIME TRACKING - Stop Timer.pdf
│   │   │   │   │   ├── 19. TIME TRACKING - Manual Entry Creation.pdf
│   │   │   │   │   ├── 2. ANA REQUEST PIPELINE (Süper Detaylı - Teknik Ekip İçin).pdf
│   │   │   │   │   ├── 20. TICKETS - Ticket Creation.pdf
│   │   │   │   │   ├── 21. TICKETS - Status Update Flow.pdf
│   │   │   │   │   ├── 22. TICKETS - Assignment Flow.pdf
│   │   │   │   │   ├── 23. CONTRACTS - Contract Creation.pdf
│   │   │   │   │   ├── 24. CONTRACTS - Approval Flow.pdf
│   │   │   │   │   ├── 25. ACCOUNTING - Invoice Creation.pdf
│   │   │   │   │   ├── 25. FINANCE - Invoice Creation.pdf
│   │   │   │   │   ├── 26. ACCOUNTING - Payment Recording (Detaylı).pdf
│   │   │   │   │   ├── 26. FINANCE - Payment Recording (Detaylı).pdf
│   │   │   │   │   ├── 27. ACCOUNTING - Expense Approval.pdf
│   │   │   │   │   ├── 27. FINANCE - Expense Approval.pdf
│   │   │   │   │   ├── 28. NOTIFICATIONS - Creation & Delivery Flow.pdf
│   │   │   │   │   ├── 29. AUDIT - Sync vs Async Logging Strategies.pdf
│   │   │   │   │   ├── 3. AUTH - Login Flow.pdf
│   │   │   │   │   ├── 30. TRANSACTION MANAGEMENT - İç Yapısı (Detaylı).pdf
│   │   │   │   │   ├── 31. END-TO-END - Client Onboarding to First Invoice.pdf
│   │   │   │   │   ├── 32. END-TO-END - Ticket to Payment Flow.pdf
│   │   │   │   │   ├── 33. PRESENCE - WebSocket Room Join.pdf
│   │   │   │   │   ├── 4. AUTH - Refresh Token Flow.pdf
│   │   │   │   │   ├── 5. AUTH - Logout Flow.pdf
│   │   │   │   │   ├── 6. RBAC - 3 Katmanlı Yetkilendirme.pdf
│   │   │   │   │   ├── 7. USERS - User Registration.pdf
│   │   │   │   │   ├── 8. USERS - Profile Update.pdf
│   │   │   │   │   └── 9. USERS - Role Change.pdf
│   │   │   │   ├── database-er-diagram.pdf
│   │   │   │   ├── deployment-diagram.pdf
│   │   │   │   ├── request-pipeline.pdf
│   │   │   │   └── system-overview.pdf
│   │   │   ├── convert-to-pdf.js
│   │   │   ├── database-er-diagram.mmd
│   │   │   ├── deployment-diagram.mmd
│   │   │   ├── mermaid.min.js
│   │   │   ├── request-pipeline.mmd
│   │   │   └── system-overview.mmd
│   │   ├── api-architecture.md
│   │   ├── database-schema.md
│   │   ├── deployment-architecture.md
│   │   ├── microservices-design.md
│   │   ├── security-design.md
│   │   └── system-design.md
│   ├── business/
│   │   ├── approval-workflows.md
│   │   ├── client-onboarding.md
│   │   ├── invoicing-process.md
│   │   ├── project-workflow.md
│   │   ├── sla-guidelines.md
│   │   └── time-tracking-policy.md
│   ├── deployment/
│   │   ├── backup-restore.md
│   │   ├── ci-cd-pipeline.md
│   │   ├── docker-setup.md
│   │   ├── kubernetes-deployment.md
│   │   ├── monitoring-setup.md
│   │   ├── production-checklist.md
│   │   └── scaling-guide.md
│   ├── development/
│   │   ├── coding-standards.md
│   │   ├── contributing.md
│   │   ├── database-migrations.md
│   │   ├── debugging-guide.md
│   │   ├── environment-setup.md
│   │   ├── git-workflow.md
│   │   ├── performance-optimization.md
│   │   ├── setup-guide.md
│   │   └── testing-guide.md
│   ├── integration/
│   │   ├── calendar-integration.md
│   │   ├── email-integration.md
│   │   ├── google-drive-integration.md
│   │   ├── payment-gateway-integration.md
│   │   └── slack-integration.md
│   ├── security/
│   │   ├── access-control.md
│   │   ├── audit-logging.md
│   │   ├── data-protection.md
│   │   ├── encryption.md
│   │   ├── incident-response.md
│   │   └── security-policy.md
│   ├── troubleshooting/
│   │   ├── common-issues.md
│   │   ├── error-messages.md
│   │   ├── faq.md
│   │   └── performance-issues.md
│   ├── user-guides/
│   │   ├── admin-manual.md
│   │   ├── client-portal-guide.md
│   │   ├── designer-guide.md
│   │   ├── developer-guide.md
│   │   ├── finance-guide.md
│   │   └── project-manager-guide.md
│   ├── API_VERSIONING.md
│   ├── FRONTEND_INTEGRATION.md
│   ├── MIMARI_YOL_HARITASI.md
│   ├── PRODUCTION_DEPLOYMENT.md
│   ├── TESTING_STRATEGY.md
│   └── TODO.md
├── mermaid/
├── scripts/
│   ├── maintenance/
│   └── generate-secrets.ts
├── src/
│   ├── application/
│   │   ├── dto/
│   │   ├── ports/
│   │   │   └── repositories/
│   │   │       └── user.repository.port.ts
│   │   ├── transaction/
│   │   │   └── transaction-manager.ts
│   │   └── use-cases/
│   ├── common/
│   │   ├── constants/
│   │   │   └── pagination.constants.ts
│   │   ├── decorators/
│   │   │   ├── audit.decorator.ts
│   │   │   ├── client-user.decorator.ts
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── departments.decorator.ts
│   │   │   ├── permissions.decorator.ts
│   │   │   ├── request-id.decorator.ts
│   │   │   ├── request-ip.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── filters/
│   │   │   ├── global-exception.filter.ts
│   │   │   ├── http-exception.filter.ts
│   │   │   └── validation-exception.filter.ts
│   │   ├── guards/
│   │   │   ├── auth/
│   │   │   │   ├── client-token.guard.ts
│   │   │   │   └── jwt.guard.ts
│   │   │   ├── client-auth.guard.ts
│   │   │   ├── departments.guard.ts
│   │   │   ├── force-password-change.guard.ts
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── permissions.guard.ts
│   │   │   ├── rate-limit.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── helpers/
│   │   │   └── pagination.helper.ts
│   │   ├── interceptors/
│   │   │   ├── audit.interceptor.ts
│   │   │   ├── response.interceptor.ts
│   │   │   ├── timeout.interceptor.ts
│   │   │   └── xss.interceptor.ts
│   │   ├── middleware/
│   │   │   ├── logger.middleware.ts
│   │   │   └── request-id.middleware.ts
│   │   ├── pipes/
│   │   │   ├── parse-uuid.pipe.ts
│   │   │   └── validation.pipe.ts
│   │   └── utils/
│   │       ├── crypto.util.ts
│   │       ├── date.util.ts
│   │       ├── id.util.ts
│   │       ├── mask.util.ts
│   │       ├── pagination.util.ts
│   │       └── sanitize.util.ts
│   ├── config/
│   │   ├── app.config.ts
│   │   ├── cors.config.ts
│   │   ├── database.config.ts
│   │   ├── env.validation.ts
│   │   ├── feature-flags.config.ts
│   │   ├── jwt.config.ts
│   │   ├── mail.config.ts
│   │   ├── rate-limit.config.ts
│   │   ├── redis.config.ts
│   │   ├── security.config.ts
│   │   ├── storage.config.ts
│   │   └── swagger.config.ts
│   ├── controllers/
│   ├── database/
│   │   ├── error-mapping/
│   │   │   └── pg-error.mapper.ts
│   │   ├── migrations/
│   │   │   ├── sql/
│   │   │   │   ├── 1771241568895_create-finance-tables_down.sql
│   │   │   │   ├── 1771241568895_create-finance-tables_up.sql
│   │   │   │   ├── 1771243216602_create-ledger-tables_down.sql
│   │   │   │   ├── 1771243216602_create-ledger-tables_up.sql
│   │   │   │   ├── 1771245000000_create_contracts_meetings_files_down.sql
│   │   │   │   ├── 1771245000000_create_contracts_meetings_files_up.sql
│   │   │   │   ├── 1771491770923_initial_schema_down.sql
│   │   │   │   └── 1771491770923_initial_schema_up.sql
│   │   │   ├── 1771241568895_create-finance-tables.ts
│   │   │   ├── 1771243216602_create-ledger-tables.ts
│   │   │   ├── 1771245000000_create_contracts_meetings_files.ts
│   │   │   ├── 1771491770923_initial_schema.ts
│   │   │   ├── 1771491809014_add-missing-indexes.ts
│   │   │   └── README.md
│   │   ├── pg/
│   │   ├── query/
│   │   │   ├── base-query.ts
│   │   │   ├── filters.sql.ts
│   │   │   ├── index.ts
│   │   │   ├── pagination.sql.ts
│   │   │   └── sql.ts
│   │   ├── repositories/
│   │   │   └── base.repository.ts
│   │   ├── types/
│   │   │   ├── base.interface.ts
│   │   │   ├── contract.db.interface.ts
│   │   │   ├── file.db.interface.ts
│   │   │   ├── finance.db.interface.ts
│   │   │   ├── ledger.db.interface.ts
│   │   │   └── user.db.interface.ts
│   │   ├── database.module.ts
│   │   ├── pool.ts
│   │   ├── seed.ts
│   │   └── transaction.ts
│   ├── domain/
│   │   ├── entities/
│   │   ├── errors/
│   │   │   ├── domain-error.base.ts
│   │   │   ├── permission.error.ts
│   │   │   └── rule-violation.error.ts
│   │   ├── rules/
│   │   └── value-objects/
│   ├── infrastructure/
│   │   ├── cache/
│   │   │   ├── cache.service.ts
│   │   │   ├── rate-limit.store.ts
│   │   │   ├── redis.client.ts
│   │   │   └── redis.module.ts
│   │   ├── logging/
│   │   │   └── logger.service.ts
│   │   ├── monitoring/
│   │   │   └── health.controller.ts
│   │   ├── queue/
│   │   └── websocket/
│   │       └── redis-io.adapter.ts
│   ├── modules/
│   │   ├── audit/
│   │   │   ├── api/
│   │   │   │   ├── dto/
│   │   │   │   │   └── list-audit.query.ts
│   │   │   │   ├── interceptors/
│   │   │   │   │   └── audit.interceptor.ts
│   │   │   │   └── audit.controller.ts
│   │   │   ├── application/
│   │   │   │   ├── services/
│   │   │   │   ├── usecases/
│   │   │   │   │   ├── list-audit-logs.usecase.ts
│   │   │   │   │   └── write-audit-log.usecase.ts
│   │   │   │   ├── audit.service.spec.ts
│   │   │   │   └── audit.service.ts
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── audit-log.entity.ts
│   │   │   │   ├── rules/
│   │   │   │   │   └── audit.rules.ts
│   │   │   │   └── audit-log.entity.ts
│   │   │   ├── infrastructure/
│   │   │   │   ├── repositories/
│   │   │   │   │   └── audit-log.repository.ts
│   │   │   │   ├── sql/
│   │   │   │   │   ├── audit.sql.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── audit.repository.ts
│   │   │   ├── public/
│   │   │   │   └── audit-public.service.ts
│   │   │   └── audit.module.ts
│   │   ├── auth/
│   │   │   ├── api/
│   │   │   │   ├── dto/
│   │   │   │   │   ├── change-password.dto.ts
│   │   │   │   │   ├── force-change-password.dto.ts
│   │   │   │   │   ├── login.dto.ts
│   │   │   │   │   ├── logout.dto.ts
│   │   │   │   │   ├── refresh-token.dto.ts
│   │   │   │   │   └── refresh.dto.ts
│   │   │   │   └── auth.controller.ts
│   │   │   ├── application/
│   │   │   │   ├── services/
│   │   │   │   │   └── auth-app.service.ts
│   │   │   │   ├── usecases/
│   │   │   │   │   ├── change-password.usecase.ts
│   │   │   │   │   ├── force-change-password.usecase.ts
│   │   │   │   │   ├── login.usecase.spec.ts
│   │   │   │   │   ├── login.usecase.ts
│   │   │   │   │   ├── logout.usecase.ts
│   │   │   │   │   ├── refresh-token.usecase.ts
│   │   │   │   │   ├── refresh.usecase.ts
│   │   │   │   │   ├── register.usecase.spec.ts
│   │   │   │   │   └── register.usecase.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── password.service.ts
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   ├── models/
│   │   │   │   │   └── auth-session.model.ts
│   │   │   │   ├── rules/
│   │   │   │   │   ├── auth.rules.spec.ts
│   │   │   │   │   └── auth.rules.ts
│   │   │   │   └── auth.errors.ts
│   │   │   ├── infrastructure/
│   │   │   │   ├── repositories/
│   │   │   │   │   └── auth-token.repository.ts
│   │   │   │   ├── sql/
│   │   │   │   │   ├── auth-token.sql.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── refresh-token.repository.ts
│   │   │   ├── public/
│   │   │   │   └── auth-public.service.ts
│   │   │   └── auth.module.ts
│   │   ├── clients/
│   │   │   ├── api/
│   │   │   │   ├── dto/
│   │   │   │   │   ├── client-portal-login.dto.ts
│   │   │   │   │   ├── create-client-user.dto.ts
│   │   │   │   │   ├── create-client.dto.ts
│   │   │   │   │   ├── force-change-client-password.dto.ts
│   │   │   │   │   ├── issue-client-access-link.dto.ts
│   │   │   │   │   └── update-client.dto.ts
│   │   │   │   ├── client-portal.controller.ts
│   │   │   │   └── clients.controller.ts
│   │   │   ├── application/
│   │   │   │   ├── services/
│   │   │   │   ├── usecases/
│   │   │   │   │   ├── create-client-user.usecase.ts
│   │   │   │   │   ├── create-client.usecase.spec.ts
│   │   │   │   │   ├── create-client.usecase.ts
│   │   │   │   │   ├── force-change-client-password.usecase.ts
│   │   │   │   │   ├── issue-client-access-link.usecase.ts
│   │   │   │   │   ├── update-client.usecase.spec.ts
│   │   │   │   │   └── update-client.usecase.ts
│   │   │   │   ├── clients.service.spec.ts
│   │   │   │   └── clients.service.ts
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── client-user.entity.ts
│   │   │   │   │   └── client.entity.ts
│   │   │   │   ├── rules/
│   │   │   │   │   └── client.rules.ts
│   │   │   │   ├── client-user.entity.ts
│   │   │   │   └── client.entity.ts
│   │   │   ├── infrastructure/
│   │   │   │   ├── repositories/
│   │   │   │   │   ├── client-user.repository.ts
│   │   │   │   │   └── client.repository.ts
│   │   │   │   ├── sql/
│   │   │   │   │   ├── client-users.sql.ts
│   │   │   │   │   ├── clients.sql.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── client-users.repository.ts
│   │   │   │   ├── clients.repository.spec.ts
│   │   │   │   └── clients.repository.ts
│   │   │   ├── public/
│   │   │   │   └── clients-public.service.ts
│   │   │   └── clients.module.ts
│   │   ├── contracts/
│   │   │   ├── api/
│   │   │   │   ├── dto/
│   │   │   │   │   ├── create-contract.dto.ts
│   │   │   │   │   ├── list-contracts.query.ts
│   │   │   │   │   └── update-contract-status.dto.ts
│   │   │   │   └── contracts.controller.ts
│   │   │   ├── application/
│   │   │   │   ├── services/
│   │   │   │   ├── usecases/
│   │   │   │   │   ├── create-contract.usecase.ts
│   │   │   │   │   ├── list-expiring-contracts.usecase.ts
│   │   │   │   │   └── update-status.usecase.ts
│   │   │   │   └── contracts.service.ts
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── contract.entity.ts
│   │   │   │   ├── rules/
│   │   │   │   │   └── contract.rules.ts
│   │   │   │   ├── contract.entity.ts
│   │   │   │   ├── contract.errors.ts
│   │   │   │   └── contract.rules.ts
│   │   │   ├── infrastructure/
│   │   │   │   ├── repositories/
│   │   │   │   │   └── contract.repository.ts
│   │   │   │   ├── sql/
│   │   │   │   │   ├── contracts.sql.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── contracts.repository.spec.ts
│   │   │   │   └── contracts.repository.ts
│   │   │   ├── public/
│   │   │   │   └── contracts-public.service.ts
│   │   │   └── contracts.module.ts
│   │   ├── departments/
│   │   │   ├── api/
│   │   │   │   ├── dto/
│   │   │   │   │   ├── create-department.dto.ts
│   │   │   │   │   └── update-department.dto.ts
│   │   │   │   └── departments.controller.ts
│   │   │   ├── application/
│   │   │   │   ├── services/
│   │   │   │   └── usecases/
│   │   │   │       ├── create-department.usecase.ts
│   │   │   │       ├── get-departments.usecase.ts
│   │   │   │       └── update-department.usecase.ts
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── department.entity.ts
│   │   │   │   ├── rules/
│   │   │   │   └── department.errors.ts
│   │   │   ├── infrastructure/
│   │   │   │   ├── repositories/
│   │   │   │   │   └── department.repository.ts
│   │   │   │   └── sql/
│   │   │   │       ├── departments.sql.ts
│   │   │   │       └── index.ts
│   │   │   ├── public/
│   │   │   │   └── departments-public.service.ts
│   │   │   └── departments.module.ts
│   │   ├── files/
│   │   │   ├── api/
│   │   │   │   ├── dto/
│   │   │   │   │   └── file-upload.dto.ts
│   │   │   │   └── files.controller.ts
│   │   │   ├── application/
│   │   │   │   └── usecases/
│   │   │   │       ├── delete-file.usecase.ts
│   │   │   │       ├── get-file.usecase.ts
│   │   │   │       ├── upload-file.usecase.spec.ts
│   │   │   │       └── upload-file.usecase.ts
│   │   │   ├── domain/
│   │   │   │   ├── file.entity.ts
│   │   │   │   └── file.errors.ts
│   │   │   ├── infrastructure/
│   │   │   │   └── files.repository.ts
│   │   │   └── files.module.ts
│   │   ├── finance/
│   │   │   ├── expenses/
│   │   │   │   ├── api/
│   │   │   │   │   ├── dto/
│   │   │   │   │   │   └── create-expense.dto.ts
│   │   │   │   │   └── expenses.controller.ts
│   │   │   │   ├── application/
│   │   │   │   │   ├── usecases/
│   │   │   │   │   │   ├── create-expense.usecase.spec.ts
│   │   │   │   │   │   ├── create-expense.usecase.ts
│   │   │   │   │   │   ├── list-expenses.usecase.ts
│   │   │   │   │   │   └── update-expense-status.usecase.ts
│   │   │   │   │   └── expenses.service.ts
│   │   │   │   ├── domain/
│   │   │   │   │   ├── expense.entity.ts
│   │   │   │   │   └── expense.errors.ts
│   │   │   │   ├── infrastructure/
│   │   │   │   │   └── expenses.repository.ts
│   │   │   │   └── expenses.module.ts
│   │   │   ├── invoices/
│   │   │   │   ├── api/
│   │   │   │   │   ├── dto/
│   │   │   │   │   │   ├── create-invoice.dto.ts
│   │   │   │   │   │   ├── invoice-query.dto.ts
│   │   │   │   │   │   └── update-invoice-status.dto.ts
│   │   │   │   │   └── invoices.controller.ts
│   │   │   │   ├── application/
│   │   │   │   │   ├── usecases/
│   │   │   │   │   │   ├── create-invoice.usecase.spec.ts
│   │   │   │   │   │   ├── create-invoice.usecase.ts
│   │   │   │   │   │   ├── list-invoices.usecase.ts
│   │   │   │   │   │   └── update-invoice-status.usecase.ts
│   │   │   │   │   └── invoices.service.ts
│   │   │   │   ├── domain/
│   │   │   │   │   ├── invoice.entity.ts
│   │   │   │   │   └── invoice.errors.ts
│   │   │   │   ├── infrastructure/
│   │   │   │   │   ├── sql/
│   │   │   │   │   │   └── invoices.sql.ts
│   │   │   │   │   ├── invoices.repository.spec.ts
│   │   │   │   │   └── invoices.repository.ts
│   │   │   │   └── invoices.module.ts
│   │   │   ├── ledger/
│   │   │   │   ├── api/
│   │   │   │   ├── application/
│   │   │   │   │   └── ledger.service.ts
│   │   │   │   ├── domain/
│   │   │   │   │   ├── ledger-account.entity.ts
│   │   │   │   │   └── ledger-entry.entity.ts
│   │   │   │   ├── infrastructure/
│   │   │   │   │   └── ledger.repository.ts
│   │   │   │   └── ledger.module.ts
│   │   │   ├── payments/
│   │   │   │   ├── api/
│   │   │   │   │   ├── dto/
│   │   │   │   │   │   └── create-payment.dto.ts
│   │   │   │   │   └── payments.controller.ts
│   │   │   │   ├── application/
│   │   │   │   │   ├── usecases/
│   │   │   │   │   │   ├── list-payments-by-invoice.usecase.ts
│   │   │   │   │   │   ├── process-payment.usecase.spec.ts
│   │   │   │   │   │   └── process-payment.usecase.ts
│   │   │   │   │   └── payments.service.ts
│   │   │   │   ├── domain/
│   │   │   │   │   └── payment.entity.ts
│   │   │   │   ├── infrastructure/
│   │   │   │   │   └── payments.repository.ts
│   │   │   │   └── payments.module.ts
│   │   │   └── finance.module.ts
│   │   ├── health/
│   │   │   ├── api/
│   │   │   │   └── health.controller.ts
│   │   │   └── health.module.ts
│   │   ├── meetings/
│   │   │   ├── api/
│   │   │   │   ├── dto/
│   │   │   │   │   ├── convert-to-ticket.dto.ts
│   │   │   │   │   ├── create-meeting.dto.ts
│   │   │   │   │   └── update-meeting.dto.ts
│   │   │   │   └── meetings.controller.ts
│   │   │   ├── application/
│   │   │   │   ├── services/
│   │   │   │   ├── usecases/
│   │   │   │   │   ├── convert-to-ticket.usecase.ts
│   │   │   │   │   ├── create-meeting.usecase.ts
│   │   │   │   │   └── update-meeting.usecase.ts
│   │   │   │   ├── meetings.service.spec.ts
│   │   │   │   └── meetings.service.ts
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── meeting.entity.ts
│   │   │   │   ├── rules/
│   │   │   │   │   └── meeting.rules.ts
│   │   │   │   ├── meeting.entity.ts
│   │   │   │   └── meeting.errors.ts
│   │   │   ├── infrastructure/
│   │   │   │   ├── repositories/
│   │   │   │   │   └── meeting.repository.ts
│   │   │   │   ├── sql/
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── meetings.sql.ts
│   │   │   │   └── meetings.repository.ts
│   │   │   ├── public/
│   │   │   │   └── meetings-public.service.ts
│   │   │   └── meetings.module.ts
│   │   ├── notifications/
│   │   │   ├── api/
│   │   │   │   ├── dto/
│   │   │   │   │   ├── create-notification.dto.ts
│   │   │   │   │   ├── list-notifications.query.ts
│   │   │   │   │   ├── mark-all-read.dto.ts
│   │   │   │   │   ├── mark-read.dto.ts
│   │   │   │   │   ├── notification-query.dto.ts
│   │   │   │   │   └── send-email.dto.ts
│   │   │   │   └── notifications.controller.ts
│   │   │   ├── application/
│   │   │   │   ├── event-handlers/
│   │   │   │   │   └── notification.handlers.ts
│   │   │   │   ├── services/
│   │   │   │   │   └── notification.service.ts
│   │   │   │   ├── usecases/
│   │   │   │   │   ├── create-notification.usecase.ts
│   │   │   │   │   ├── mark-all-read.usecase.ts
│   │   │   │   │   ├── mark-read.usecase.ts
│   │   │   │   │   ├── send-email.usecase.spec.ts
│   │   │   │   │   └── send-email.usecase.ts
│   │   │   │   ├── notifications.service.spec.ts
│   │   │   │   └── notifications.service.ts
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── notification.entity.ts
│   │   │   │   ├── rules/
│   │   │   │   │   └── notification.rules.ts
│   │   │   │   └── notification.entity.ts
│   │   │   ├── infrastructure/
│   │   │   │   ├── repositories/
│   │   │   │   │   └── notification.repository.ts
│   │   │   │   ├── sql/
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── notifications.sql.ts
│   │   │   │   ├── notifications.repository.spec.ts
│   │   │   │   └── notifications.repository.ts
│   │   │   ├── public/
│   │   │   │   └── notifications-public.service.ts
│   │   │   ├── transport/
│   │   │   │   └── notifications.gateway.ts
│   │   │   └── notifications.module.ts
│   │   ├── presence/
│   │   │   ├── api/
│   │   │   │   └── dto/
│   │   │   │       └── join-project.dto.ts
│   │   │   ├── application/
│   │   │   │   ├── presence.service.spec.ts
│   │   │   │   └── presence.service.ts
│   │   │   ├── transport/
│   │   │   │   ├── guards/
│   │   │   │   │   └── ws-jwt-auth.guard.ts
│   │   │   │   └── presence.gateway.ts
│   │   │   └── presence.module.ts
│   │   ├── projects/
│   │   │   ├── api/
│   │   │   │   ├── dto/
│   │   │   │   │   ├── add-member.dto.ts
│   │   │   │   │   ├── assign-client.dto.ts
│   │   │   │   │   ├── create-project.dto.ts
│   │   │   │   │   ├── project-query.dto.ts
│   │   │   │   │   ├── update-github-url.dto.ts
│   │   │   │   │   ├── update-project-status.dto.ts
│   │   │   │   │   └── update-project.dto.ts
│   │   │   │   └── projects.controller.ts
│   │   │   ├── application/
│   │   │   │   ├── services/
│   │   │   │   ├── usecases/
│   │   │   │   │   ├── assign-client.usecase.ts
│   │   │   │   │   ├── create-project.usecase.spec.ts
│   │   │   │   │   ├── create-project.usecase.ts
│   │   │   │   │   ├── update-github-url.usecase.ts
│   │   │   │   │   ├── update-project.usecase.ts
│   │   │   │   │   ├── update-status.usecase.spec.ts
│   │   │   │   │   └── update-status.usecase.ts
│   │   │   │   └── projects.service.ts
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── project.entity.ts
│   │   │   │   ├── rules/
│   │   │   │   │   └── project.rules.ts
│   │   │   │   ├── project.entity.ts
│   │   │   │   └── project.rules.ts
│   │   │   ├── infrastructure/
│   │   │   │   ├── repositories/
│   │   │   │   │   └── project.repository.ts
│   │   │   │   ├── sql/
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── projects.sql.ts
│   │   │   │   ├── projects.repository.int-spec.ts
│   │   │   │   ├── projects.repository.spec.ts
│   │   │   │   └── projects.repository.ts
│   │   │   ├── public/
│   │   │   │   └── projects-public.service.ts
│   │   │   └── projects.module.ts
│   │   ├── reports/
│   │   │   ├── api/
│   │   │   │   ├── dto/
│   │   │   │   │   ├── generate-financial-report.dto.ts
│   │   │   │   │   └── generate-project-analytics.dto.ts
│   │   │   │   └── reports.controller.ts
│   │   │   ├── application/
│   │   │   │   └── usecases/
│   │   │   │       ├── dashboard-summary.usecase.ts
│   │   │   │       ├── generate-financial-report.usecase.spec.ts
│   │   │   │       ├── generate-financial-report.usecase.ts
│   │   │   │       └── generate-project-analytics.usecase.ts
│   │   │   └── reports.module.ts
│   │   ├── roles/
│   │   │   ├── api/
│   │   │   │   ├── dto/
│   │   │   │   │   ├── assign-permissions.dto.ts
│   │   │   │   │   ├── create-role.dto.ts
│   │   │   │   │   └── update-role.dto.ts
│   │   │   │   └── roles.controller.ts
│   │   │   ├── application/
│   │   │   │   ├── services/
│   │   │   │   └── usecases/
│   │   │   │       ├── assign-permissions.usecase.ts
│   │   │   │       ├── create-role.usecase.ts
│   │   │   │       ├── get-permissions.usecase.ts
│   │   │   │       ├── get-roles.usecase.ts
│   │   │   │       └── update-role.usecase.ts
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── permission.entity.ts
│   │   │   │   │   └── role.entity.ts
│   │   │   │   ├── rules/
│   │   │   │   │   └── rbac.rules.ts
│   │   │   │   └── role.errors.ts
│   │   │   ├── infrastructure/
│   │   │   │   ├── repositories/
│   │   │   │   │   ├── permission.repository.ts
│   │   │   │   │   └── role.repository.ts
│   │   │   │   └── sql/
│   │   │   │       ├── index.ts
│   │   │   │       ├── permissions.sql.ts
│   │   │   │       └── roles.sql.ts
│   │   │   ├── public/
│   │   │   │   └── roles-public.service.ts
│   │   │   └── roles.module.ts
│   │   ├── tasks/
│   │   │   ├── api/
│   │   │   │   ├── dto/
│   │   │   │   │   ├── create-task.dto.ts
│   │   │   │   │   └── update-task.dto.ts
│   │   │   │   └── tasks.controller.ts
│   │   │   ├── application/
│   │   │   │   ├── usecases/
│   │   │   │   │   ├── create-task.usecase.spec.ts
│   │   │   │   │   ├── create-task.usecase.ts
│   │   │   │   │   ├── get-task.usecase.ts
│   │   │   │   │   ├── list-tasks.usecase.spec.ts
│   │   │   │   │   ├── list-tasks.usecase.ts
│   │   │   │   │   ├── update-task-status.usecase.ts
│   │   │   │   │   └── update-task.usecase.ts
│   │   │   │   └── tasks.service.ts
│   │   │   ├── domain/
│   │   │   │   ├── task.entity.ts
│   │   │   │   └── task.rules.ts
│   │   │   ├── infrastructure/
│   │   │   │   ├── sql/
│   │   │   │   │   └── tasks.sql.ts
│   │   │   │   └── tasks.repository.ts
│   │   │   └── tasks.module.ts
│   │   ├── tickets/
│   │   │   ├── api/
│   │   │   │   ├── dto/
│   │   │   │   │   ├── assign-ticket.dto.ts
│   │   │   │   │   ├── create-ticket.dto.ts
│   │   │   │   │   ├── list-tickets.query.ts
│   │   │   │   │   ├── ticket-query.dto.ts
│   │   │   │   │   └── update-ticket-status.dto.ts
│   │   │   │   └── tickets.controller.ts
│   │   │   ├── application/
│   │   │   │   ├── services/
│   │   │   │   ├── usecases/
│   │   │   │   │   ├── approve-ticket.usecase.ts
│   │   │   │   │   ├── assign-ticket.usecase.ts
│   │   │   │   │   ├── create-ticket.usecase.spec.ts
│   │   │   │   │   ├── create-ticket.usecase.ts
│   │   │   │   │   ├── get-ticket.usecase.ts
│   │   │   │   │   ├── list-tickets.usecase.spec.ts
│   │   │   │   │   ├── list-tickets.usecase.ts
│   │   │   │   │   ├── update-status.usecase.ts
│   │   │   │   │   └── update-ticket-status.usecase.ts
│   │   │   │   └── tickets.service.ts
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── ticket.entity.ts
│   │   │   │   ├── rules/
│   │   │   │   │   └── ticket.rules.ts
│   │   │   │   ├── ticket.entity.ts
│   │   │   │   └── ticket.rules.ts
│   │   │   ├── infrastructure/
│   │   │   │   ├── repositories/
│   │   │   │   │   └── ticket.repository.ts
│   │   │   │   ├── sql/
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── tickets.sql.ts
│   │   │   │   └── tickets.repository.ts
│   │   │   ├── public/
│   │   │   │   └── tickets-public.service.ts
│   │   │   └── tickets.module.ts
│   │   ├── time-tracking/
│   │   │   ├── api/
│   │   │   │   ├── dto/
│   │   │   │   │   ├── cancel-time-entry.dto.ts
│   │   │   │   │   ├── create-time-entry.dto.ts
│   │   │   │   │   ├── list-time-entries.query.ts
│   │   │   │   │   ├── start-time-entry.dto.ts
│   │   │   │   │   ├── start-timer.dto.ts
│   │   │   │   │   ├── stop-timer.dto.ts
│   │   │   │   │   └── time-entry-query.dto.ts
│   │   │   │   └── time-tracking.controller.ts
│   │   │   ├── application/
│   │   │   │   ├── queries/
│   │   │   │   │   └── list-time-entries.query.ts
│   │   │   │   ├── services/
│   │   │   │   ├── usecases/
│   │   │   │   │   ├── cancel-entry.usecase.ts
│   │   │   │   │   ├── list-entries.usecase.ts
│   │   │   │   │   ├── start-timer.usecase.ts
│   │   │   │   │   └── stop-timer.usecase.ts
│   │   │   │   └── time-tracking.service.ts
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── time-entry.entity.ts
│   │   │   │   ├── rules/
│   │   │   │   │   └── time-tracking.rules.ts
│   │   │   │   ├── time-entry.entity.ts
│   │   │   │   └── time-tracking.errors.ts
│   │   │   ├── infrastructure/
│   │   │   │   ├── repositories/
│   │   │   │   │   └── time-entry.repository.ts
│   │   │   │   ├── sql/
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── time-tracking.sql.ts
│   │   │   │   ├── time-entries.repository.spec.ts
│   │   │   │   └── time-entries.repository.ts
│   │   │   ├── public/
│   │   │   │   └── time-tracking-public.service.ts
│   │   │   └── time-tracking.module.ts
│   │   └── users/
│   │       ├── api/
│   │       │   ├── dto/
│   │       │   │   ├── change-department.dto.ts
│   │       │   │   ├── change-role.dto.ts
│   │       │   │   ├── create-user.dto.ts
│   │       │   │   ├── export-users.query.ts
│   │       │   │   ├── list-users.query.ts
│   │       │   │   ├── update-user.dto.ts
│   │       │   │   └── user-query.dto.ts
│   │       │   └── users.controller.ts
│   │       ├── application/
│   │       │   ├── services/
│   │       │   │   └── users-app.service.ts
│   │       │   ├── usecases/
│   │       │   │   ├── change-department.usecase.ts
│   │       │   │   ├── change-role.usecase.ts
│   │       │   │   ├── create-user.usecase.spec.ts
│   │       │   │   ├── create-user.usecase.ts
│   │       │   │   ├── deactivate-user.usecase.ts
│   │       │   │   ├── export-users.usecase.ts
│   │       │   │   ├── update-user.usecase.spec.ts
│   │       │   │   └── update-user.usecase.ts
│   │       │   └── users.service.ts
│   │       ├── domain/
│   │       │   ├── entities/
│   │       │   │   └── user.entity.ts
│   │       │   ├── rules/
│   │       │   │   └── user.rules.ts
│   │       │   ├── value-objects/
│   │       │   │   ├── email.vo.ts
│   │       │   │   └── phone.vo.ts
│   │       │   ├── user.entity.spec.ts
│   │       │   ├── user.entity.ts
│   │       │   └── user.errors.ts
│   │       ├── infrastructure/
│   │       │   ├── repositories/
│   │       │   │   └── user.repository.ts
│   │       │   ├── sql/
│   │       │   │   ├── index.ts
│   │       │   │   └── users.sql.ts
│   │       │   ├── users.repository.int-spec.ts
│   │       │   ├── users.repository.spec.ts
│   │       │   └── users.repository.ts
│   │       ├── public/
│   │       │   └── users-public.service.ts
│   │       └── users.module.ts
│   ├── shared/
│   │   ├── audit/
│   │   │   ├── audit.helpers.ts
│   │   │   ├── audit.module.ts
│   │   │   ├── audit.service.ts
│   │   │   └── audit.types.ts
│   │   ├── dto/
│   │   │   ├── api-response.dto.ts
│   │   │   ├── date-range.dto.ts
│   │   │   ├── page-meta.dto.ts
│   │   │   └── page.dto.ts
│   │   ├── email/
│   │   │   ├── interfaces/
│   │   │   │   └── email-service.interface.ts
│   │   │   ├── providers/
│   │   │   │   └── emailjs.provider.ts
│   │   │   └── email.module.ts
│   │   ├── enums/
│   │   │   ├── approval-status.enum.ts
│   │   │   ├── contract-status.enum.ts
│   │   │   ├── contract-type.enum.ts
│   │   │   ├── currency.enum.ts
│   │   │   ├── department.enum.ts
│   │   │   ├── index.ts
│   │   │   ├── ledger-entry-type.enum.ts
│   │   │   ├── payment-method.enum.ts
│   │   │   ├── permission.enum.ts
│   │   │   ├── priority.enum.ts
│   │   │   ├── project-status.enum.ts
│   │   │   ├── role.enum.ts
│   │   │   ├── ticket-status.enum.ts
│   │   │   ├── ticket-type.enum.ts
│   │   │   └── transaction-type.enum.ts
│   │   ├── errors/
│   │   │   ├── conflict.error.ts
│   │   │   ├── domain.error.ts
│   │   │   ├── forbidden.error.ts
│   │   │   └── not-found.error.ts
│   │   ├── events/
│   │   │   ├── handlers/
│   │   │   │   ├── audit.handlers.ts
│   │   │   │   └── notification.handlers.ts
│   │   │   ├── event-bus.module.ts
│   │   │   ├── event.constants.ts
│   │   │   └── event.types.ts
│   │   ├── files/
│   │   │   ├── storage/
│   │   │   │   ├── local-storage.provider.ts
│   │   │   │   ├── s3-storage.provider.ts
│   │   │   │   └── storage.provider.interface.ts
│   │   │   ├── validators/
│   │   │   │   ├── file-size.validator.ts
│   │   │   │   └── file-type.validator.ts
│   │   │   ├── files.module.ts
│   │   │   └── files.service.ts
│   │   ├── i18n/
│   │   │   └── messages.ts
│   │   ├── notifications/
│   │   │   ├── notifications.factory.ts
│   │   │   ├── notifications.module.ts
│   │   │   ├── notifications.service.ts
│   │   │   └── notifications.types.ts
│   │   └── security/
│   │       ├── encryption.service.ts
│   │       ├── field-visibility.service.ts
│   │       ├── password-policy.ts
│   │       ├── rate-limit.service.ts
│   │       └── token.service.ts
│   ├── test/
│   │   ├── test-container.ts
│   │   └── test-utils.ts
│   ├── types/
│   │   └── node-pg-migrate.d.ts
│   ├── app.controller.spec.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts
├── test/
│   ├── e2e/
│   ├── helpers/
│   │   ├── e2e-environment.ts
│   │   └── e2e-seeder.ts
│   ├── integration/
│   ├── unit/
│   ├── app.e2e-spec.js
│   ├── app.e2e-spec.ts
│   ├── auth.e2e-spec.ts
│   ├── client-portal.e2e-spec.ts
│   ├── clients.e2e-spec.ts
│   ├── contracts.e2e-spec.ts
│   ├── debug-files.ts
│   ├── files-notifications.e2e-spec.ts
│   ├── finance.e2e-spec.ts
│   ├── jest-e2e.json
│   ├── manual-e2e-projects.ts
│   ├── manual-e2e.ts
│   ├── meetings.e2e-spec.ts
│   ├── projects.e2e-spec.ts
│   ├── roles-departments.e2e-spec.ts
│   ├── send-test-email.ts
│   ├── system.e2e-spec.ts
│   ├── tasks.e2e-spec.ts
│   ├── tickets.e2e-spec.ts
│   ├── time-tracking.e2e-spec.ts
│   ├── tsconfig.e2e.json
│   └── users.e2e-spec.ts
├── uploads/
│   ├── 0a77b04e-19fc-4ae8-9386-abe320adec65.txt
│   ├── 1d13c39d-32bc-4ca6-b390-13c3f56bdf86.txt
│   ├── 28c17d79-ade7-4c20-8ead-26ef5bdd5e00.txt
│   ├── a3f488db-725a-4e7b-81df-6d23453bfa70.txt
│   ├── a6ecd770-0785-4e0b-89ac-c59e80c1ffb0.txt
│   ├── d642d23f-e567-463c-8fe9-511a40da7766.txt
│   └── db5b05a2-f886-44fa-ade8-b74751326b7b.txt
├── .dockerignore
├── .editorconfig
├── .env
├── .env.example
├── .env.production
├── .env.staging
├── .eslintignore
├── .eslintrc.cjs
├── .gitignore
├── .prettierignore
├── .prettierrc
├── AKIS_SEMASI.md
├── architecture_issues.txt
├── BOS_DOSYALAR_ANALIZI.md
├── build-error.txt
├── CHANGELOG.md
├── CONTRIBUTING.md
├── database.json
├── docker_build_error.log
├── docker-compose.yml
├── Dockerfile
├── e2e_tickets.json
├── EK_MODULLER_YOL_HARITASI.md
├── empty_files_list.txt
├── eslint.config.mjs
├── extract_errors.js
├── extracted_test_errors.txt
├── FAZ_35_VE_SONRASI_YOL_HARITASI.md
├── fix_schema.sql
├── generate_migration.ts
├── generate-tree.js
├── infra_stubs.json
├── jest-report.json
├── jest.config.ts
├── LICENSE.md
├── log.txt
├── manual-test-output.txt
├── MIMARI_DOKUMANTASYON.md
├── module_report.json
├── nest-cli.json
├── package-lock.json
├── package.json
├── Proje_Mimarisi.md
├── README.md
├── seed_out.txt
├── seed_output.log
├── sql_error_log.txt
├── stub_files_list.txt
├── task.md
├── temp_schemas.sql
├── test_output.txt
├── test-output.txt
├── tmp_login.json
├── ts_errors.log
├── tsc_check.txt
├── tsc_errors.txt
├── tsc-error-log.txt
├── tsconfig.build.json
├── tsconfig.build.tsbuildinfo
├── tsconfig.json
├── unused_exports.txt
├── unused_summary.txt
├── unused_utf8.txt
├── unused_vars.json
├── unused_vars.txt
├── YAPILACAKLAR_backup.md
├── YAPILACAKLAR.md
└── YOL_HARITASI.md
```

</details>

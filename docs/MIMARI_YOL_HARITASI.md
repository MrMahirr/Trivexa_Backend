# 🏗️ Trivexa Backend - Mimari Refaktör & Tamamlama Yol Haritası

Bu yol haritası, projedeki boş dosyaları (`EMPTY_FILES.md`) doldurmak ve mevcut "Pragmatic Service-Based" yapıyı, `docs/` klasöründeki mimariye tam uyumlu "Strict Clean Architecture" yapısına dönüştürmek için hazırlanmıştır.

## 🚨 Kritik Karar: Accounting Modülü
`src/modules/accounting` klasörü, `src/modules/finance` ile büyük oranda çakışmaktadır. **Öneri**: `accounting` klasörü silinmeli ve tüm finansal işlemler `finance` modülü altında birleştirilmelidir. Bu, boş dosya sayısını ~80 adet azaltacaktır.

---

## 📅 FAZ 11: Temel ve Ortak Yapıların Tamamlanması (Shared & Common)
**Hedef**: Tüm modüllerin kullanacağı ortak yapı taşlarını doldurmak.

- [x] **11.1 Constants & Enums**
  - `src/common/constants/*.ts` (audit, header, pagination, token)
  - `src/shared/enums/*.ts` (eksik enumlar)
- [x] **11.2 Decorators & Guards**
  - `src/common/decorators/*.ts` (`@ClientUser`, `@RequestIp`)
  - `src/common/guards/*.ts` (`ClientAuthGuard`)
- [x] **11.3 Interceptors & Filters**
  - `src/common/interceptors/*.ts` (`AuditInterceptor`, `TimeoutInterceptor`)
  - `src/common/filters/*.ts` (`ValidationExceptionFilter`)
- [x] **11.4 Shared Utilities**
  - `src/common/utils/*.ts` (Crypto, Date, Masking, Sanitization)

## 📅 FAZ 12: Database Architecture Hardening
**Hedef**: Veritabanı katmanını domain'den izole etmek ve tip güvenliğini artırmak.

- [ ] **12.1 Database Types**: `src/database/types/*.ts` (DB Schema Interfaces)
- [ ] **12.2 Base Repository**: `src/database/repositories/base.repository.ts` (Generic CRUD)

## 📅 FAZ 13: Modül Refaktörü - Logic Taşıma (Migration to UseCases)
**Hedef**: `Service` sınıflarındaki iş mantığını parçalayarak `Use Case` ve `Domain Rule` dosyalarına taşımak.

### 13.1 Auth Module Refactor
- [x] `AuthService` içindeki login/register mantığını `LoginUseCase` ve `RegisterUseCase`'e taşı.
- [x] `AuthRules` (şifre politikaları vb.) implementasyonu.

### 13.2 Users & Clients Module Refactor
- [x] `UsersService` -> `CreateUserUseCase`, `UpdateUserUseCase`.
- [x] `UserEntity` içine domain kurallarını (zengin model) ekle.
- [x] `ClientsService` -> `CreateClientUseCase`, `UpdateClientUseCase`.

### 13.3 Finance (Accounting) Module Refactor
- [x] `finance` modülünü `accounting` isterlerini kapsayacak şekilde genişlet.
- [x] `Invoice`, `Expense`, `Payment` için UseCase'leri oluştur.
- [x] `accounting` modülü silindi ve `finance` ile birleştirildi.

### 13.4 Reports Module Refactor (Yeni Faz)
- [x] `ReportsModule` oluşturuldu.
- [x] `GenerateFinancialReportUseCase` ve `GenerateProjectAnalyticsUseCase` eklendi.

## 📅 FAZ 14: Infrastructure Katmanı Ayrıştırması
**Hedef**: SQL sorgularını ve dış servis entegrasyonlarını `infrastructure` katmanına tam izole etmek.

- [ ] **14.1 SQL Dosyaları**: Repository içindeki raw SQL'leri `src/modules/*/infrastructure/sql/*.ts` dosyalarına taşı.
- [ ] **14.2 Repository Implementation**: Repository'leri sadece SQL çağırıp Domain Entity döndüren aptal (dumb) sınıflara dönüştür.

## 📅 FAZ 15: Audit & Notifications (Cross-Cutting) (Tamamlandı)
- [x] **15.1 Audit**: `AuditInterceptor` ve `WriteAuditLogUseCase` entegrasyonu.
- [x] **15.2 Notifications**: `CreateNotificationUseCase` ve `NotificationService` entegrasyonu.

---

## 🛡️ Koruma Stratejisi (Proje Bozulmadan Nasıl Yapılır?)

1.  **Side-by-Side (Yan Yana) Geliştirme**: Mevcut `Service`'leri hemen silmeyeceğiz. Önce `UseCase`'i yazacağız, `Service` içinden bu `UseCase`'i çağıracağız.
2.  **Test Odaklı**: Her UseCase için önce unit test yazılacak (veya mevcut testler güncellenecek).
3.  **Feature Flag**: Büyük değişiklikler (örn: Finance modülü) gerekirse feature flag arkasında geliştirilecek.

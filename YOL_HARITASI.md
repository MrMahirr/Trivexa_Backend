# 🗺️ Trivexa Backend — Yol Haritası & Yapılacaklar

> **Son Güncelleme:** 22 Şubat 2026  
> **Genel İlerleme:** ✅ 178 / 179 görev tamamlandı (%99)

---

## 📊 Mevcut Proje Durumu

### Modül Bazlı Özet

| # | Modül | Dosya | UseCase | Test | Durum |
|---|-------|-------|---------|------|-------|
| 1 | `auth` | 30 | ✅ | ✅ 3 test | ✅ Tamamlandı |
| 2 | `users` | 31 | ✅ | ✅ 5 test | 🟡 Refaktör bekliyor |
| 3 | `clients` | 26 | ✅ | ❌ | 🟡 Refaktör bekliyor |
| 4 | `projects` | 28 | ✅ | ✅ 4 test | ✅ Tamamlandı |
| 5 | `tasks` | 16 | ✅ | ✅ 2 test | ✅ Tamamlandı |
| 6 | `tickets` | 26 | ✅ | ✅ 2 test | ✅ Tamamlandı |
| 7 | `finance` | 35 | ✅ | ❌ | 🟡 Refaktör bekliyor |
| 8 | `contracts` | 17 | ✅ | ❌ | 🟢 Kod tamam, test eksik |
| 9 | `time-tracking` | 23 | ✅ | ❌ | 🟢 Kod tamam, test eksik |
| 10 | `notifications` | 23 | ✅ | ❌ | 🟢 Kod tamam, test eksik |
| 11 | `audit` | 15 | ✅ | ❌ | 🟢 Kod tamam, test eksik |
| 12 | `roles` | 19 | ✅ | ❌ | 🟢 Kod tamam, test eksik |
| 13 | `departments` | 12 | ✅ | ❌ | 🟢 Kod tamam, test eksik |
| 14 | `meetings` | 17 | ✅ | ❌ | 🟢 Kod tamam, test eksik |
| 15 | `files` | 8 | ❌ | ❌ | 🟢 Kod tamam, test eksik |
| 16 | `reports` | 6 | ✅ | ❌ | 🟢 Kod tamam, test eksik |
| 17 | `health` | 2 | ❌ | ❌ | ✅ Tamamlandı (basit modül) |

---

## 🔴 FAZ 21: Kritik — Unit Test Yazımı

> **Öncelik:** Yüksek | **Tahmini Süre:** 3-5 gün

Şu anda sadece 5 modülde (auth, users, projects, tasks, tickets) test mevcut. Geri kalan 12 modülde hiç test yok. Minimum test kapsamı hedeflenmeli.

### 21.1 Finance Modülü Testleri ✅
- [x] `create-invoice.usecase.spec.ts` — 7 test
- [x] `process-payment.usecase.spec.ts` — 7 test
- [x] `create-expense.usecase.spec.ts` — 5 test
- [x] `invoices.repository.spec.ts` — 11 test

### 21.2 Clients Modülü Testleri ✅
- [x] `create-client.usecase.spec.ts` — 5 test
- [x] `update-client.usecase.spec.ts` — 7 test
- [x] `clients.service.spec.ts` (client-portal) — 7 test
- [x] `clients.repository.spec.ts` — 12 test

### 21.3 Contracts Modülü Testleri ✅
- [x] `contracts.service.spec.ts` (create/approve/sign) — 13 test
- [x] `contracts.repository.spec.ts` — 11 test

### 21.4 Time Tracking Modülü Testleri ✅
- [x] `time-tracking.service.spec.ts` (start/stop/approve) — 14 test
- [x] `time-entries.repository.spec.ts` — 14 test

### 21.5 Notifications Modülü Testleri ✅
- [x] `notifications.service.spec.ts` — 8 test
- [x] `send-email.usecase.spec.ts` — 5 test
- [x] `notifications.repository.spec.ts` — 11 test

### 21.6 Diğer Modül Testleri ✅
- [x] `audit` — `audit.service.spec.ts` — 2 test
- [x] `roles` — `role.repository.spec.ts` — 4 test
- [x] `departments` — `department.repository.spec.ts` — 4 test
- [x] `meetings` — `meetings.service.spec.ts` — 6 test
- [x] `files` — `upload-file.usecase.spec.ts` — 2 test
- [x] `reports` — `generate-financial-report.usecase.spec.ts` — 3 test

---

## ✅ FAZ 22: Modül Refaktörü — UseCase Pattern Tamamlama

> **Öncelik:** Orta-Yüksek | **Tahmini Süre:** 2-3 gün  
> *(YAPILACAKLAR.md FAZ 2'den kalan görevler)*

### 22.1 Users & Clients Module Refactor ✅
- [x] `DeactivateUserUseCase` — boş stub'a mantık taşındı
- [x] `UsersService` → tüm metotlar UseCase'e delege edildi (facade)
- [x] `users.module.ts` — `DeactivateUserUseCase` provider eklendi
- [x] `ClientsService` — zaten UseCase pattern'e uygun ✅

### 22.2 Finance (Accounting) Module Refactor ✅
- [x] `InvoicesService` → `CreateInvoiceUseCase`, `ListInvoicesUseCase`, `UpdateInvoiceStatusUseCase`
- [x] `PaymentsService` → `ProcessPaymentUseCase`, `ListPaymentsByInvoiceUseCase`
- [x] `ExpensesService` → `CreateExpenseUseCase`, `ListExpensesUseCase`, `UpdateExpenseStatusUseCase`

---

## 🟡 FAZ 23: Altyapı Temizliği & Optimizasyon

> **Öncelik:** Orta | **Tahmini Süre:** 1-2 gün  
> *(YAPILACAKLAR.md FAZ 19'dan kalan görevler)*

### 23.1 Kod Temizliği
- [x] Kullanılmayan importları temizle (tüm modüller)
- [x] Kullanılmayan dosya ve constant'ları kaldır
- [x] ESLint ile tam proje taraması yap ve hataları düzelt

### 23.2 Loglama & Hata Yönetimi Son Kontrol
- [x] Tüm modüllerde tutarlı loglama yapıldığını doğrula
- [x] Custom exception'ların tüm modüllerde kullanıldığını kontrol et
- [x] Global exception filter'ın tüm hata tiplerini kapsadığını doğrula

---

## 🟢 FAZ 24: API Dökümantasyonu (Swagger/OpenAPI)

> **Öncelik:** Orta | **Tahmini Süre:** 2-3 gün

### 24.1 Swagger Kurulumu
- [x] `@nestjs/swagger` kurulumu ve konfigürasyonu
- [x] Global API prefix ve versiyonlama ayarları
- [x] Bearer Auth şeması tanımla

### 24.2 Endpoint Dökümantasyonu
- [x] Auth modülü — Login, Register, Refresh, Logout endpoint açıklamaları
- [x] Users modülü — CRUD, Role Change, Deactivation endpoint açıklamaları
- [x] Clients modülü — Client CRUD, Portal Access endpoint açıklamaları
- [x] Projects modülü — Project CRUD, Status, Team Assignment endpoint açıklamaları
- [x] Finance modülü — Invoice, Payment, Expense endpoint açıklamaları
- [x] Tickets modülü — Ticket CRUD, Assignment, Status endpoint açıklamaları
- [x] Time Tracking modülü — Timer Start/Stop, Manual Entry endpoint açıklamaları
- [x] Contracts modülü — Contract CRUD, Approval endpoint açıklamaları
- [x] Diğer modüller — Notifications, Audit, Reports, Meetings, Files

### 24.3 DTO Dökümantasyonu
- [x] Tüm DTO'lara `@ApiProperty()` dekoratörleri ekle
- [x] Request/Response örnekleri ekle
- [x] Validation kurallarını dökümante et

---

## 🟢 FAZ 25: E2E (Entegrasyon) Testleri

> **Öncelik:** Orta-Düşük | **Tahmini Süre:** 3-4 gün

### 25.1 Test Altyapısı & Tamamlananlar
- [x] Test veritabanı konfigürasyonu (Testcontainers & PostgreSQL)
- [x] Test seeder oluşturuldu (E2eSeeder)
- [x] Supertest ile HTTP test altyapısı kuruldu
- [x] **Auth Modülü** E2E testleri (`auth.e2e-spec.ts`)
- [x] **Users Modülü** E2E testleri (`users.e2e-spec.ts`)
- [x] **Clients Modülü** E2E testleri (`clients.e2e-spec.ts`)
- [x] **App/Root** testleri (`app.e2e-spec.ts`)

### 25.2 Uygulama Yol Haritası (Eksik E2E Testler)
Eksik modüllerin karmaşıklık ve bağımlılık sırasına göre **5 Grup** halinde uçtan uca testleri yazılacaktır. Önceliğe göre sıralanmıştır:

#### Grup 1: Kurumsal Yapı (Corporate Core)
- [x] `test/roles-departments.e2e-spec.ts` (Rol ve Departman CRUD, yetki atamaları)

#### Grup 2: Operasyon ve Proje (Operations)
- [x] `test/projects.e2e-spec.ts` (Proje yaratma, durum güncelleme, üye ekleme/çıkarma)
- [x] `test/tasks.e2e-spec.ts` (Projeye task ekleme, task durumu güncelleme)
- [x] `test/time-tracking.e2e-spec.ts` (Zaman kaydı başlatma, durdurma, raporlama)
- [x] `test/client-portal.e2e-spec.ts` (Müşteri login ve dashboard erişimi)

#### Grup 3: Finans ve Sözleşmeler (Finance & Contracts)
- [x] `test/finance.e2e-spec.ts` (Faturalar, Ödemeler ve Gider girişleri/onayları)
- [x] `test/contracts.e2e-spec.ts` (Sözleşme oluşturma, imzalama statüleri)

#### Grup 4: İletişim ve Destek (Support & Comm)
- [x] `test/tickets.e2e-spec.ts` (Destek talebi oluşturma, yanıtlama, kapatma)
- [x] `test/meetings.e2e-spec.ts` (Toplantı planlama, davetli ekleme)
- [x] `test/files-notifications.e2e-spec.ts` (Dosya yükleme mock testleri, bildirim tetiklenmeleri)

#### Grup 5: Sistem ve Denetim (System & Audit)
- [x] `test/system.e2e-spec.ts` (Sistem logları, rapor üreten endpointler, health check)

---

## 🟢 FAZ 26: Güvenlik Güçlendirme

> **Öncelik:** Orta-Düşük | **Tahmini Süre:** 1-2 gün

### 26.1 Rate Limiting
- [x] `@nestjs/throttler` kurulumu
- [x] Login endpoint için agresif rate limiting (5 istek/dakika)
- [x] Genel API rate limiting (100 istek/dakika)
- [x] IP bazlı ve kullanıcı bazlı throttling

### 26.2 Güvenlik Başlıkları
- [x] Helmet.js konfigürasyon kontrolü
- [x] CORS ayarlarını production için sıkılaştır
- [x] Content Security Policy (CSP) ayarla

### 26.3 Input Sanitization
- [x] XSS koruması için input temizleme
- [x] SQL injection koruması kontrol et (parametrik sorgular)
- [x] File upload güvenlik kontrolleri (dosya tipi, boyut)

---

## 🟢 FAZ 27: CI/CD Pipeline

> **Öncelik:** Düşük | **Tahmini Süre:** 1 gün

### 27.1 GitHub Actions / Pipeline
- [x] Lint kontrolü (ESLint)
- [x] Unit test çalıştırma
- [x] Build kontrolü
- [x] Docker image oluşturma
- [x] Otomatik deployment (staging/production)

### 27.2 Docker Optimizasyonu
- [x] Multi-stage Dockerfile oluştur
- [x] `docker-compose.yml` güncelle (backend + postgres + redis)
- [x] Health check endpoint'i Docker'a bağla

---

## 🟢 FAZ 28: Production Hazırlığı

> **Öncelik:** Düşük | **Tahmini Süre:** 1-2 gün

### 28.1 Performance
- [x] Query performans analizi (EXPLAIN ANALYZE)
- [x] N+1 sorgu sorunlarını tespit et ve düzelt
- [x] Redis cache stratejisini gözden geçir
- [x] Veritabanı indekslerini kontrol et

### 28.2 Monitoring & Logging
- [x] Yapılandırılmış (structured) loglama
- [x] Health check endpoint'i zenginleştir (DB, Redis, Disk durumu)
- [x] Error tracking entegrasyonu (Sentry vb.)

### 28.3 Son Kontroller
- [x] Environment variable doğrulama (tüm gerekli değişkenler tanımlı mı?)
- [x] Veritabanı migration'ları sıralı mı?
- [x] Seed verisi güncel mi?
- [x] README.md güncelle (kurulum, çalıştırma, API bilgileri)

---

## 📅 Önerilen Çalışma Sırası

```
FAZ 21 (Testler)         ████████████████░░░░  3-5 gün
FAZ 22 (Refaktör)        ██████████░░░░░░░░░░  2-3 gün
FAZ 23 (Temizlik)        ████████░░░░░░░░░░░░  1-2 gün
FAZ 24 (Swagger)         ██████████░░░░░░░░░░  2-3 gün
FAZ 25 (E2E Test)        ████████████░░░░░░░░  3-4 gün
FAZ 26 (Güvenlik)        ████████░░░░░░░░░░░░  1-2 gün
FAZ 27 (CI/CD)           ████░░░░░░░░░░░░░░░░  1 gün
FAZ 28 (Production)      ████████████████████  1-2 gün
                                        Toplam: ~15-22 gün
```

---

> 💡 **Not:** Bu yol haritası mevcut `YAPILACAKLAR.md` dosyasındaki kalan görevleri ve proje analizinden çıkan eksiklikleri kapsar. Her fazın tamamlanmasının ardından bu dosya güncellenmelidir.

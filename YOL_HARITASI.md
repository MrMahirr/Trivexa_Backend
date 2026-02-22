# 🗺️ Trivexa Backend — Yol Haritası & Yapılacaklar

> **Son Güncelleme:** 22 Şubat 2026  
> **Genel İlerleme:** ✅ 172 / 173 görev tamamlandı (%99)

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

## 🟡 FAZ 22: Modül Refaktörü — UseCase Pattern Tamamlama

> **Öncelik:** Orta-Yüksek | **Tahmini Süre:** 2-3 gün  
> *(YAPILACAKLAR.md FAZ 2'den kalan görevler)*

### 22.1 Users & Clients Module Refactor
- [ ] `UsersService` → `CreateUserUseCase`, `UpdateUserUseCase`, `DeactivateUserUseCase` ayrıştırılacak
- [ ] `ClientsService` → `CreateClientUseCase`, `UpdateClientUseCase` ayrıştırılacak
- [ ] Eski service dosyaları kaldırılacak veya facade olarak bırakılacak

### 22.2 Finance (Accounting) Module Refactor
- [ ] `InvoiceService` → `CreateInvoiceUseCase`, `UpdateInvoiceUseCase` ayrıştırılacak
- [ ] `PaymentService` → `RecordPaymentUseCase` ayrıştırılacak
- [ ] `ExpenseService` → `CreateExpenseUseCase`, `ApproveExpenseUseCase` ayrıştırılacak

---

## 🟡 FAZ 23: Altyapı Temizliği & Optimizasyon

> **Öncelik:** Orta | **Tahmini Süre:** 1-2 gün  
> *(YAPILACAKLAR.md FAZ 19'dan kalan görevler)*

### 23.1 Kod Temizliği
- [ ] Kullanılmayan importları temizle (tüm modüller)
- [ ] Kullanılmayan dosya ve constant'ları kaldır
- [ ] ESLint ile tam proje taraması yap ve hataları düzelt

### 23.2 Loglama & Hata Yönetimi Son Kontrol
- [ ] Tüm modüllerde tutarlı loglama yapıldığını doğrula
- [ ] Custom exception'ların tüm modüllerde kullanıldığını kontrol et
- [ ] Global exception filter'ın tüm hata tiplerini kapsadığını doğrula

---

## 🟢 FAZ 24: API Dökümantasyonu (Swagger/OpenAPI)

> **Öncelik:** Orta | **Tahmini Süre:** 2-3 gün

### 24.1 Swagger Kurulumu
- [ ] `@nestjs/swagger` kurulumu ve konfigürasyonu
- [ ] Global API prefix ve versiyonlama ayarları
- [ ] Bearer Auth şeması tanımla

### 24.2 Endpoint Dökümantasyonu
- [ ] Auth modülü — Login, Register, Refresh, Logout endpoint açıklamaları
- [ ] Users modülü — CRUD, Role Change, Deactivation endpoint açıklamaları
- [ ] Clients modülü — Client CRUD, Portal Access endpoint açıklamaları
- [ ] Projects modülü — Project CRUD, Status, Team Assignment endpoint açıklamaları
- [ ] Finance modülü — Invoice, Payment, Expense endpoint açıklamaları
- [ ] Tickets modülü — Ticket CRUD, Assignment, Status endpoint açıklamaları
- [ ] Time Tracking modülü — Timer Start/Stop, Manual Entry endpoint açıklamaları
- [ ] Contracts modülü — Contract CRUD, Approval endpoint açıklamaları
- [ ] Diğer modüller — Notifications, Audit, Reports, Meetings, Files

### 24.3 DTO Dökümantasyonu
- [ ] Tüm DTO'lara `@ApiProperty()` dekoratörleri ekle
- [ ] Request/Response örnekleri ekle
- [ ] Validation kurallarını dökümante et

---

## 🟢 FAZ 25: E2E (Entegrasyon) Testleri

> **Öncelik:** Orta-Düşük | **Tahmini Süre:** 3-4 gün

### 25.1 Test Altyapısı
- [ ] Test veritabanı konfigürasyonu (ayrı PostgreSQL instance veya test schema)
- [ ] Test seeder oluştur (örnek verilerle veritabanını doldur)
- [ ] Supertest ile HTTP test altyapısı kur

### 25.2 Uçtan Uca Test Senaryoları
- [ ] **Auth akışı:** Register → Login → Refresh → Logout
- [ ] **Kullanıcı yönetimi:** Create → Update → Role Change → Deactivate
- [ ] **Müşteri akışı:** Client Create → Client User → Magic Link → Portal Login
- [ ] **Proje akışı:** Project Create → Team Assign → Status Update
- [ ] **Bilet akışı:** Ticket Create → Assign → Status Update → Close
- [ ] **Zaman takibi:** Start Timer → Stop Timer → Manual Entry
- [ ] **Finans akışı:** Invoice Create → Payment Record → Expense Approve
- [ ] **Sözleşme akışı:** Contract Create → Approve → Activate

---

## 🟢 FAZ 26: Güvenlik Güçlendirme

> **Öncelik:** Orta-Düşük | **Tahmini Süre:** 1-2 gün

### 26.1 Rate Limiting
- [ ] `@nestjs/throttler` kurulumu
- [ ] Login endpoint için agresif rate limiting (5 istek/dakika)
- [ ] Genel API rate limiting (100 istek/dakika)
- [ ] IP bazlı ve kullanıcı bazlı throttling

### 26.2 Güvenlik Başlıkları
- [ ] Helmet.js konfigürasyon kontrolü
- [ ] CORS ayarlarını production için sıkılaştır
- [ ] Content Security Policy (CSP) ayarla

### 26.3 Input Sanitization
- [ ] XSS koruması için input temizleme
- [ ] SQL injection koruması kontrol et (parametrik sorgular)
- [ ] File upload güvenlik kontrolleri (dosya tipi, boyut)

---

## 🟢 FAZ 27: CI/CD Pipeline

> **Öncelik:** Düşük | **Tahmini Süre:** 1 gün

### 27.1 GitHub Actions / Pipeline
- [ ] Lint kontrolü (ESLint)
- [ ] Unit test çalıştırma
- [ ] Build kontrolü
- [ ] Docker image oluşturma
- [ ] Otomatik deployment (staging/production)

### 27.2 Docker Optimizasyonu
- [ ] Multi-stage Dockerfile oluştur
- [ ] `docker-compose.yml` güncelle (backend + postgres + redis)
- [ ] Health check endpoint'i Docker'a bağla

---

## 🟢 FAZ 28: Production Hazırlığı

> **Öncelik:** Düşük | **Tahmini Süre:** 1-2 gün

### 28.1 Performance
- [ ] Query performans analizi (EXPLAIN ANALYZE)
- [ ] N+1 sorgu sorunlarını tespit et ve düzelt
- [ ] Redis cache stratejisini gözden geçir
- [ ] Veritabanı indekslerini kontrol et

### 28.2 Monitoring & Logging
- [ ] Yapılandırılmış (structured) loglama
- [ ] Health check endpoint'i zenginleştir (DB, Redis, Disk durumu)
- [ ] Error tracking entegrasyonu (Sentry vb.)

### 28.3 Son Kontroller
- [ ] Environment variable doğrulama (tüm gerekli değişkenler tanımlı mı?)
- [ ] Veritabanı migration'ları sıralı mı?
- [ ] Seed verisi güncel mi?
- [ ] README.md güncelle (kurulum, çalıştırma, API bilgileri)

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
FAZ 28 (Production)      ████████░░░░░░░░░░░░  1-2 gün
                                        Toplam: ~15-22 gün
```

---

> 💡 **Not:** Bu yol haritası mevcut `YAPILACAKLAR.md` dosyasındaki kalan görevleri ve proje analizinden çıkan eksiklikleri kapsar. Her fazın tamamlanmasının ardından bu dosya güncellenmelidir.

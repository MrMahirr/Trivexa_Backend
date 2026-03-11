# Trivexa Platform - Genel Başlangıç ve Mimari Dokümantasyonu

Bu doküman, Trivexa projesinin "Büyük Resmini" (Big Picture) ve genel sistem mimarisini açıklayan üst düzey (High-Level) bir referans kaynağıdır. Şirket içi geliştiriciler, DevOps mühendisleri, mimarlar ve proje paydaşlarının sisteme hızlıca entegre olabilmesi (Onboarding) hedeflenerek hazırlanmıştır.

## 1. Genel Bakış ve Kapsam (Overview & Scope)

### Proje Amacı
Trivexa; işletmelerin müşteri portföylerini, projelerini, finansal işlemlerini (fatura, ödeme, masraf vb.), sözleşmelerini ve şirket içi süreçlerini tek bir merkezden yönetmelerini sağlayan kapsamlı bir ERP ve CRM platformudur. 

### Hedef Kitle ve Kullanıcı Rolleri
Sistem birden fazla kullanıcı profilini destekleyecek şekilde tasarlanmıştır:
*   **Süper Admin / Yöneticiler:** Tüm sistem modüllerine, ayarlara ve raporlamalara tam yetkiyle erişen teknik ve idari ekip.
*   **İdari/Finans Personeli:** Fatura kesme, ödeme takibi, sözleşme onaylama gibi finansal/hukuki süreçleri yöneten ekip.
*   **Proje Yöneticisi / Üretim Ekibi:** Projelerin yürütülmesi, görevlerin atanması ve zaman takiplerinden sorumlu çalışanlar.
*   **Yetkili Müşteri (Client Portal):** Sadece kendi projelerini, faturalarını, ödemelerini ve oluşturdukları destek taleplerini (ticket) görebilen, sınırlandırılmış harici kullanıcılar.

## 2. Sistem Mimarisi ve Teknoloji Yığını (Tech Stack)

Trivexa, mikroservis odaklı modüler bir Monolith (Modulith) yaklaşımıyla inşa edilmiş modern bir web uygulamasıdır. Backend, Frontend ve Landing Page (Tanıtım) olmak üzere üç ana alt projeden oluşur.

### 2.1 Teknoloji Yığını (Stack)
*   **Backend:** Node.js, NestJS (TypeScript), PostgreSQL (TypeORM veya Native SQL katmanlı), Redis (Caching & WebSockets).
*   **Frontend (Admin/Personel Paneli):** React.js, Vite, TypeScript, Tailwind CSS (Custom Design System).
*   **Frontend (Müşteri/Landing Paneli):** React.js, Vite, TypeScript (SEO ve hız odaklı, kısıtlı tünel erişimli portal).
*   **Altyapı (Infrastructure):** Docker & Docker Compose (Containerization), GitHub Actions (CI/CD).

### 2.2 Mimari Yaklaşım (Architecture Pattern)
Backend tarafında **Domain-Driven Design (DDD)** pratikleri ve **Clean Architecture** prensipleri sıkı bir şekilde uygulanmaktadır. Her bir iş modülü (`users`, `clients`, `finance`, `projects`, `tickets` vb.) kendi içinde bağımsızkatmanlara sahiptir:
1.  **API (Presentation):** RESTful Controller'lar, DTO'lar, Interceptor ve filtreler.
2.  **Application (Use Cases):** İş mantığının orkestrasyonu, servis sınıfları. (Örn: `ProcessPaymentUseCase`).
3.  **Domain:** Çekirdek iş kuralları, Entity'ler, özel hatalar (Domain Errors). Çoğu iş kuralı (business rule) burada validate edilir.
4.  **Infrastructure:** Veritabanı (Repository Pattern), harici servis entegrasyonları (Email, File Storage), SQL scriptleri.

Bu ayrım, uzun vadeli sürdürülebilirlik ve modüllerin ileride ayrı mikroservislere kolayca bölünebilmesi (Strangler Fig Pattern) için kritik bir tercihtir.

## 3. Geliştirici Rehberi (Developer Guide & Onboarding)

Sisteme dahil olan yeni bir geliştiricinin ilk yapması gerekenler:

### 3.1 Önkoşullar
*   Node.js (v18+)
*   Docker ve Docker Compose
*   Git

### 3.2 Lokal Geliştirme Ortamı (Local Setup)
Tüm servisler lokal ortamda Docker ile ayağa kaldırılabilir şekilde tasarlanmıştır.

1.  **Backend Kurulumu:**
    ```bash
    cd trivexa_backend
    cp .env.example .env
    # .env içerisindeki DB_PASSWORD, JWT_SECRET gibi değerleri doldurun
    npm install
    docker-compose up -d # PostgreSQL ve Redis'i ayağa kaldırır
    npm run build
    npm run start:dev
    ```

2.  **Frontend Kurulumu (Yönetim Paneli):**
    ```bash
    cd trivexa-web
    cp .env.example .env.local
    npm install
    npm run dev
    ```

3.  **Landing & Müşteri Paneli Kurulumu:**
    ```bash
    cd trivexa-landing
    cp .env.example .env.local
    npm install
    npm run dev
    ```

### 3.3 Ortak Geliştirme Pratikleri
*   **Strict TypeScript:** Tüm projelerde `tsc -b` (Build) strict modda çalıştırılmaktadır. Implicit `any` kullanımından kaçının.
*   **Lint ve Format:** `npm run lint` komutu ile ESLint uyumluluğunu kontrol edin. PR (Pull Request) öncesi lokalinizde tüm lint hatalarını sıfırladığınızdan emin olun. React projelerinde Fast Refresh uyarılarına (Hooks Scope, Export Defaults) dikkat edin.
*   **Test Stratejisi:** Backend tarafında katmanlı mimariye uygun Unit Testler ve kritik senaryolar (Payment, Invoice, Routing vb.) için Integration Testler mevcuttur. Kod yazarken TDD (Test Driven Development) yaklaşımı teşvik edilir. (Örn: `npm run test`).

## 4. Yetkilendirme ve Kimlik Yönetimi (Auth & RBAC)

Trivexa'da birden fazla giriş noktası olduğu için karmaşık ve katmanlı bir yetkilendirme sistemi bulunur.

*   **Personel Kimlik Doğrulaması (JWT):** Standart email/şifre doğrulaması sonrası asimetrik JWT üretilir. Refresh token mekanizması (Redis-backed) aktiftir.
*   **Rol Bazlı Erişim (RBAC):** Kullanıcılara belirli Rol ve İzinler (Permissions) atanır (Guard katmanında `RolesGuard` ve `PermissionsGuard` ile kontrol edilir).
*   **Müşteri Kimlik Doğrulaması (Magic Link / Portal Token):** Harici müşteriler, güvenli "Magic Link"ler üzerinden spesifik tünel şifreleriyle kısıtlı müşteri portalına (`trivexa-landing` projesi) erişim sağlarlar.

## 5. Kritik İş Akışları (Key Business Flows)

### Fatura ve Ödeme Akışı (Finance Flow)
Trivexa'nın kalbidir. İşlem bütünlüğünün korunması (ACID) zorunludur.
1. Proje veya manuel yolla `Invoice` (Fatura) oluşturulur.
2. Müşteri `Client Portal` üzerinden faturayı görüntüler.
3. Ödeme eklendiğinde (`ProcessPaymentUseCase`), bir **Transaction** (Veritabanı işlemi) başlatılır.
4. Önce `Payment` kaydı atılır, başarılıysa `Invoice` durumu güncellenir.
5. Herhangi bir aşamada hata çıkarsa (Örn: Veritabanı hatası), işlem tamamen geri alınır (Rollback).

### Zaman Takibi (Time Tracking)
Proje çalışanlarının saatlik maliyetlerini hesaplamak için `Start/Stop Timer` sistemi websocketler yardımıyla anlık olarak işlenir. 

## 6. DevOps, CI/CD ve Süreç Standartları

*   **Branching:** `main` (Production), `staging` (Test), ve `feature/*` veya `fix/*` (Geliştirme) dalları (branch) kullanılır.
*   **CI Pipeline:** Her PR (Pull Request) oluşturulduğunda GitHub Actions devreye girer. Typescript derleme testi (`tsc`), Lint testi (`eslint`) ve Unit/E2E testleri (`jest`) otomatik çalıştırılarak kalite kapıları (Quality Gates) oluşturulmuştur.
*   **Monitoring (SRE):** Merkezi log yönetimi, Audit logları (Kullanıcı eylem geçmişi) ve sağlık kontrol noktaları (Health Checks) aktif olarak dinlenmektedir. Hatalar formatlanarak (`GlobalExceptionFilter`) sisteme ve client'a tutarlı şekilde iletilir.

---
**Önemli Not:** Daha detaylı "Servis bazlı" C4 diyagramları, özel iş mantığı belgeleri ve API Endpoint dökümanları (Swagger vb.) backend `/docs` klasörü altında incelenebilir.

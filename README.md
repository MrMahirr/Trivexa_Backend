# Trivexa Backend API

Trivexa projesinin sunucu taraflı API uygulamasıdır. **Node.js** ve **NestJS** altyapısı üzerinde, veritabanı olarak **PostgreSQL**, caching ve sıralama gereksinimleri için **Redis** kullanılarak inşa edilmiştir.

## 🚀 Proje Durumu (Frontend'e Hazır)

- **Sıfır Derleme Hatası:** Proje Typescript strict kuralları ile 0 hata derlenir (`tsc --noEmit`).
- **ESLint Temiz:** Kod kalitesi ve linting standartları bakımından projedeki tüm kurallar düzeltilmiştir (0 Error).
- **CORS Hazır:** Frontend (örn: React/Next.js vb.) uygulamasından gelen erişimler için ayarlanabilirdir. (Varsayılan `http://localhost:3000`)
- **JWT Korumalı:** Rotalara ek olarak WebSocket (Socket.io) yayınları dahil olmak üzere erişim JWT koruması altındadır.

## 📦 Temel Modüller ve Özellikler

16'dan fazla özellik modülü ayrıştırılmıştır (Clean Architecture):

- **Auth & Users:** Kapsamlı kimlik doğrulama, kullanıcı rol ve izin yönetimi.
- **Projects & Tasks:** Proje tabanlı iş planlama sistemi.
- **Active Users Presence (WebSocket):** Projede kimlerin o anda aktif görüntülemede olduğunun gerçek zamanlı takibi. (Multi-tab destekli)
- **Finance & Contracts:** Bütçe, faturalama ve sözleşme süreçleri.
- **Tickets & Meetings:** Müşteri/Kullanıcı destek hattı ve ortak toplantı organizasyonları.
- **Time Tracking:** Kullanıcı bazlı görevlerin zaman ölçümleri.
- **Notifications & Audit:** E-posta/Uygulama içi bildirimler ve detaylı sistem denetim günlükleri (Audit Logs).
- **Core Features:** Rate Limiting (Throttler), Gzip Compression, Helmet security.

---

## 🛠️ Teknolojiler ve Araçlar

- **Framework:** NestJS (Express tabanlı)
- **Veritabanı:** PostgreSQL (`pg`, TypeORM / Query Builder vb.)
- **Önbellek (Cache):** Redis (`ioredis`, `@nestjs/cache-manager`)
- **Gerçek Zamanlı İletişim:** `socket.io`, `@nestjs/websockets`
- **Doğrulama (Auth):** JWT (JSON Web Token), Passport
- **Migration & Seed:** `node-pg-migrate`, TypeScript ile özel seed mekanizması
- **Test:** Jest (Unit ve End-to-End testler)
- **Docker:** `Dockerfile` ve `docker-compose.yml` ile container desteği
- **Güvenlik:** Helmet, xss-clean, CORS, `@nestjs/throttler` (Rate Limiting)

## 🚦 Başlangıç ve Kurulum

Öncelikle gereksinimlerin (Node.js v18+, PostgreSQL ve Redis) sisteminizde kurulu olduğundan emin olun veya **Docker** kullanın.

### 1. Depoyu Klonlayın

```bash
git clone <repository-url>
cd trivexa_backend
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Çevre Değişkenleri (.env)

Proje kök dizininde `.env.example` dosyasını kopyalayarak `.env` dosyasını oluşturun:

```bash
cp .env.example .env
```

İçerisindeki veritabanı, Redis ve JWT ayarlarını kendi ortamınıza göre güncelleyin. Örneğin:

```env
APP_PORT=3500
CORS_ORIGIN=http://localhost:3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=trivexa_user
DB_PASSWORD=trivexa_pass
DB_NAME=trivexa_db
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_ACCESS_SECRET=your_super_secret_dev_key
```

### 4. Veritabanı Migration ve Seed

Veritabanı tablolarını oluşturmak ve test amaçlı (veya varsayılan Admin) verilerini yüklemek için:

```bash
# Tabloları oluşturur ve indeksleri atar
npm run migrate:up

# Örnek verileri basar (Her tabloda en az 10 kayıt ve Admin, Manager rolleri)
npm run seed
```

**Not:** Öntanımlı gelen yetkili hesaplardan biri `admin@trivexa.com` (şifre: `password123`) şeklindedir.

---

## 💻 Projeyi Çalıştırma

Geliştirme, production veya watch modlarında NestJS sunucusunu ayaklandırmak için:

```bash
# Development (Geliştirme)
npm run start

# Watch Mode (Canlı Yeniden Yükleme)
npm run start:dev

# Production (Canlı Ortam) - Önce 'npm run build' yapılmalıdır
npm run build
npm run start:prod
```

### Docker Üzerinden Çalıştırma

Tüm altyapıyı (API, Veritabanı ve Redis) tek komutla kurup ayağa kaldırmak için:

```bash
docker-compose up -d --build
```

Bu komut sonrası API `http://localhost:3500` portundan hizmet vermeye başlar.

---

## 📖 Swagger API Dokümantasyonu

Projeyi çalıştırdıktan sonra, tüm endpointleri test edebilmek ve şemaları görmek için **Swagger** arayüzüne erişebilirsiniz:
👉 **[http://localhost:3500/api/docs](http://localhost:3500/api/docs)**

## 🌐 WebSocket (Real-Time) Entegrasyonu

`Presence` modülü `/presence` namespace'i üzerinden hizmet verir.
Frontend entegrasyonu için `socket.io-client` kullanırken handshake ayarlarınıza yetkili JWT token'ını eklemelisiniz:

```javascript
const socket = io('http://localhost:3500/presence', {
  auth: { token: 'YOUR_JWT_TOKEN' },
  transports: ['websocket'],
});
```

---

## 🧪 Testler

Projeye ait test senaryolarını çalıştırmak için `jest` komutları yapılandırılmıştır. Uçtan uca (E2E) testler tüm projeyi test veritabanı sıfırlaması ile test eder.

```bash
# Unit (Birim) testleri çalıştır (şayet varsa)
npm run test

# Tüm E2E test senaryolarını sıralı (band) halinde çalıştır
npm run test:e2e
```

---

## 📊 İzleme ve Loglama (Monitoring & Logging)

- API üzerinde `/health` endpoint'ine GET isteği atarak, sunucunun;
  - Node.js Çalışma Süresi ve Bellek Kullanımını,
  - Veritabanı (PostgreSQL) Bağlantı Durumunu,
  - Redis Önbellek Sunucusu erişilebilirliğini test edebilirsiniz.
- Gelen istekler `requestId` eşliğinde `LoggerMiddleware` üzerinden structured log olarak kaydedilir. Production ortamında sistem hataları da JSON formatında basılarak dış Error Tracking yazılımlarına (Sentry vd.) uygun hale getirilmiştir.

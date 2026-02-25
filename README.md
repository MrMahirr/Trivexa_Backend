# Trivexa Backend API

Trivexa projesinin sunucu taraflı API uygulamasıdır. **Node.js** ve **NestJS** altyapısı üzerinde, veritabanı olarak **PostgreSQL**, caching ve sıralama gereksinimleri için **Redis** kullanılarak inşa edilmiştir.

## Teknolojiler ve Araçlar
- **Framework:** NestJS (Express tabanlı)
- **Veritabanı:** PostgreSQL (`pg`, Query Builder)
- **Önbellek (Cache):** Redis (`ioredis`, `@nestjs/cache-manager`)
- **Doğrulama (Auth):** JWT (JSON Web Token), Passport
- **Migration & Seed:** `node-pg-migrate`, TypeScript ile özel seed mekanizması
- **Test:** Jest (Unit ve End-to-End testler)
- **Docker:** `Dockerfile` ve `docker-compose.yml` ile container desteği
- **Güvenlik:** Helmet, xss-clean, CORS, `@nestjs/throttler` (Rate Limiting)

## Başlangıç ve Kurulum

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

## Projeyi Çalıştırma

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

## Swagger API Dokümantasyonu

Projeyi çalıştırdıktan sonra, tüm endpointleri test edebilmek ve şemaları görmek için **Swagger** arayüzüne erişebilirsiniz:
👉 **[http://localhost:3500/api/docs](http://localhost:3500/api/docs)**

---

## Testler

Projeye ait test senaryolarını çalıştırmak için `jest` komutları yapılandırılmıştır. Uçtan uca (E2E) testler tüm projeyi test veritabanı sıfırlaması ile test eder.

```bash
# Unit (Birim) testleri çalıştır (şayet varsa)
npm run test

# Tüm E2E test senaryolarını sıralı (band) halinde çalıştır
npm run test:e2e
```

---

## İzleme ve Loglama (Monitoring & Logging)

- API üzerinde `/health` endpoint'ine GET isteği atarak, sunucunun;
  - Node.js Çalışma Süresi ve Bellek Kullanımını,
  - Veritabanı (PostgreSQL) Bağlantı Durumunu,
  - Redis Önbellek Sunucusu erişilebilirliğini test edebilirsiniz.
- Gelen istekler `requestId` eşliğinde `LoggerMiddleware` üzerinden structured log olarak kaydedilir. Production ortamında sistem hataları da JSON formatında basılarak dış Error Tracking yazılımlarına (Sentry vd.) uygun hale getirilmiştir.

# Trivexa Backend

## Proje Genel Bakış

Trivexa, ajansların ve şirketlerin müşteri, proje, finans ve destek taleplerini (ticket) yönetebilmesi için geliştirilmiş kapsamlı bir backend yönetim sistemidir. Sistem, NestJS framework'ü kullanılarak modüler ve Clean Architecture prensiplerine uygun olarak inşa edilmiştir.

## Teknoloji Stack

Trivexa backend projesinde en güncel ve performanslı teknolojiler tercih edilmiştir:

- **Framework:** NestJS (Node.js)
- **Dil:** TypeScript
- **Veritabanı:** PostgreSQL (Raw SQL queries with `pg` driver)
- **Önbellekleme & Oturum:** Redis (`cache-manager-redis-yet`)
- **Containerization:** Docker & Docker Compose
- **Kimlik Doğrulama:** JWT (Access ve Refresh Token)
- **API Dokümantasyonu:** Swagger (OpenAPI)
- **Veritabanı Göçleri (Migrations):** `node-pg-migrate`

## Proje Klasör Yapısı (Özet)

Aşağıda projenin kök `src` dizinindeki temel klasörlerin işlevleri yer almaktadır:

```text
src/
├── app.module.ts            # Ana root modül
├── main.ts                  # NestJS uygulamasının bootstrapping adımı
├── common/                  # Uygulama genelinde kullanılan dekoratörler, filtreler, intereptörler ve guard'lar
├── config/                  # Ortam değişkenleri (Environment) doğrulama ve yapılandırma dosyaları
├── database/                # PostgreSQL bağlantı havuzu (pool.ts) konfigürasyonu
├── infrastructure/          # Dış servis entegrasyonları (Redis Cache yapısı vb.)
├── modules/                 # İş tarafındaki her bir domain'in ayrıştırıldığı alt modüller dizini
│   ├── auth/                # Kimlik doğrulama, JWT stratejileri ve use-case'ler
│   ├── users/               # Sistem kullanıcıları (Admin, Manager vb.) yönetimi
│   ├── clients/             # Ajans/Müşteri hesapları ve "Client User" yönetimi
│   ├── finance/             # Faturalar, ödemeler ve giderler
│   ├── tickets/             # Destek talepleri ve ticket işleyişi
│   ├── ...                  # Diğer modüller (projects, tasks, vb.)
└── shared/                  # Loglama, Audit tablosu, Event-Bus gibi paylaşılan logic
```

> Detaylı Mimari anlatımı için `ARCHITECTURE.md` dosyasına göz atabilirsiniz.

## Ortam Değişkenleri (Environment Variables)

Projenin çalışması için kök dizinde bir `.env` dosyası oluşturulmalıdır. Örnek yapılandırma:

| Değişken                 | Açıklama                                     | Örnek Değer         |
| ------------------------ | -------------------------------------------- | ------------------- |
| `NODE_ENV`               | Çalışma ortamı (`development`, `production`) | `development`       |
| `PORT`                   | Uygulamanın çalışacağı port                  | `3500`              |
| `DB_HOST`                | PostgreSQL sunucu adresi                     | `localhost`         |
| `DB_PORT`                | PostgreSQL portu                             | `5432`              |
| `DB_USER`                | Veritabanı kullanıcısı                       | `postgres`          |
| `DB_PASSWORD`            | Veritabanı şifresi                           | `postgres`          |
| `DB_NAME`                | Veritabanı adı                               | `trivexa_db`        |
| `JWT_SECRET`             | Access Token için gizli anahtar              | `super-secret-key`  |
| `JWT_EXPIRES_IN`         | Access Token geçerlilik süresi               | `15m`               |
| `JWT_REFRESH_SECRET`     | Refresh Token için gizli anahtar             | `super-refresh-key` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh Token geçerlilik süresi              | `7d`                |
| `REDIS_HOST`             | Redis sunucu adresi                          | `localhost`         |
| `REDIS_PORT`             | Redis portu                                  | `6379`              |

## Kurulum ve Çalıştırma Seçenekleri

### 1. Docker ile Kurulum (Önerilen)

Proje, PostgreSQL ve Redis servislerini otomatik yapılandıran `docker-compose.yml` dosyasına sahiptir.

```bash
# Repo'yu klonlayın
git clone <repo_url>
cd trivexa_backend

# Ortam değişkeni dosyasını oluşturun (değerleri projeye göre doldurun)
cp .env.example .env

# Docker container'larını arka planda başlatın
docker-compose up -d --build
```

> Docker kullanıldığında, `node-pg-migrate` migration'ları `entrypoint.sh` üzerinden otomatik olarak çalıştırılır. Uygulamanız anında `localhost:3500`'de (varsayılan port) aktif olacaktır.

### 2. Lokal Geliştirme Ortamı

Eğer Node.js ile direkt olarak lokalinizde çalıştırmak istiyorsanız PostgreSQL ve Redis servislerinizin lokalde (veya harici bir dev sunucusunda) çalışır olduğundan emin olun.

```bash
# 1. Bağımlılıkları yükleyin
npm install

# 2. Ortam değişken dosyalarınızı hazırlayın
cp .env.example .env

# 3. Veritabanı Migrations komutlarını çalıştırın (package.json içerisindeki script'lere istinaden)
npm run migrate:up

# 4. Geliştirme sunucusunu başlatın
npm run start:dev
```

## API Dokümantasyonu (Swagger)

Uygulama başarıyla başlatıldıktan sonra REST API uç noktalarına (endpoints) dair etkileşimli dokümantasyona aşağıdaki bağlantıdan erişebilirsiniz:
👉 **[http://localhost:3500/api/docs](http://localhost:3500/api/docs)**

> Not: Bu arayüz üzerinden bearer token alarak güvenli (protected) uç noktaları doğrudan test edebilirsiniz.

## Diğer Dokümanlar (Reference)

Sistemin belirli alanlarına dair derinlemesine okumalar için:

- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Clean architecture, modül izolasyonları ve design pattern'ler.
- **[AUTH.md](./AUTH.md)**: JWT token yaşam döngüsü ve Rol/Departman bazlı RBAC güvenlik modeli.
- **[DATABASE.md](./DATABASE.md)**: TypeORM olmadan Raw SQL (#pg) kullanım tercihleri ve migration akışı.
- **[API.md](./API.md)**: İstemci ve backend arası ortak iletişim sözleşmeleri (Exception Filter çıktıları vb.).
- **[DOCKER.md](./DOCKER.md)**: Deployment ve multi-stage Docker build yönergeleri.

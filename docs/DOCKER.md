# Trivexa Backend - Sürekli Dağıtım & Docker (DOCKER / DEVOPS)

Trivexa platformu modern DevOps standartlarına uygun, statik ortamlardan bağımsız "Infrastructure as Code" mantığında container'lar içerisine hapsedilerek çalışmaya (Agnostic Env) uyarlanmıştır.

## 1. Docker Compose Mimarisi

Lokal ve tek sunuculu (Single-Server, örn: basit bir VPS veya EC2) dağıtımlar (deployments) için kök dizinde yer alan `docker-compose.yml` tüm bağımlılıkları barındırır:

1. **`postgres` Container'ı:**
   - Resmi `postgres:latest` image.
   - Initial veritabanı ayarları `./docker/postgres/init` volüm mapping'inden ayağa kalkarken bash scriptleri (`.sh`/`.sql`) tarafından yürütülür.
   - Veritabanının sürekli yaşaması için host makineden `postgres_data` kalıcı Docker Volume'sine map/bind alır.
2. **`redis` Container'ı:**
   - Kimlik doğrulama, rate limiter, oturum logları ve asenkron queue eventleri (Cache Manager vs) için çok hızlı ara bellek (`redis:8-alpine`).
   - Sadece bellekle yetinmeyerek `redis-server --appendonly yes` komutuyla diske de write yapar.
3. **`app` Container'ı (Trivexa Backend REST API):**
   - Aşağıda açıklanan `Dockerfile` ile kendi yerel kodlarını Multi-stage aşamasından geçirerek derler ve kendi `trivexa_network` bridge ağından direkt olarak (Localhost mantığıyla) `postgres` ve `redis` alias name'lerine erişir.
   - `depends_on` ile önce postgres ve redis'in Container Ready State, daha önemlisi (TCP port vs) `healthcheck` pingleriyle cevap verir pozisyona geçmesini bekler. Aksi takdirede app başlatılmaz.

## 2. Multi-Stage Build & Dockerfile Süreci

Production deploy'da Image boyutlarını minimuma indirmek (`node_modules` içerisindeki geliştirici typescript derleme araçları, jest modülleri vb. den kurtulmak) amacıyla iki aşamalı derleme bulunur.

- **Stage 1 (`builder`):** Standart `node:20-alpine` ortamına tüm (Dev dahil) dependencies kurulup, `npm run build` ile projenin `.js` ve `.map` dosyalarının bulunduğu `dist/` klasörü yaratılır.
- **Stage 2 (`production`):** Tertemiz, fresh yeni bir konteynera sadece `package.json` aktarılır ve `npm ci --only=production` komutuyla çok temiz bir vendor folder indirilir. Sonra Stage 1'de yaratılan saf `dist/` klasörü bu konteynera kopyalanır.

**NEDEN MULTI-STAGE?** Imange boyutu `1.2 GB` boyutlarından `~150MB` civarlarına kadar iner, CI/CD pipeline push maliyetlerini kısaltır, Prod ortamının potansiyel zafiyet yüzeyini daraltır.

## 3. Deployment Öncesi Veritabanı (Entrypoint)

`production` image başlatılırken (Container ayağa kalkarken) `node main.js` VEYA `npm run start:prod` ÇALIŞTIRILMAZ.
Bunun yerine yetki devri Root yerine Node kullanıcısında iken, `docker/entrypoint.sh` dosyası devreye sokulur.

**`entrypoint.sh` ne işe yarar?**

- Uygulama başlatılmadan (HTTP istekleri alınmaya başlanmadan) saniyeler önce, `npm run migrate:up` komutunu trigger(tetik) eder. Bu, son versiyona (yeni atılan production sürümündeki değişen DB query'lerine) adapte olan db'ye otomatik Schema Patch işlemlerini atar. Ancak migrationlar başarıyla ve sorunsuzca veritabanına uygulanmışsa HTTP Server start alır.

## 4. Environment (.env) Yönetimi Hakkında

Docker compose kullanıldığında kök dizindeki `.env` bağımsız kalabilirken kompoze konfigürasyon içerisine direkt inject edilir:

- `$POSTGRES_USER`, `$POSTGRES_PASSWORD` vs okuyarak DB yapılandırılır. İhtiyaca yönelik olarak AWS Secrets Manager veya GitHub Repository Secrets alanları Continuous Deployment entegrasyonuna harika bir uyum sergiler.

Docker-compose ortamında kullanılan temel çevre değişkenleri yapılandırması (`.env`) şu şematiğe uyar:

```env
# Application
NODE_ENV=production
PORT=3500

# PostgreSQL
DB_HOST=postgres
DB_PORT=5432
DB_USER=trivexa_db_user
DB_PASSWORD=trivexa_super_secret
DB_NAME=trivexa_db
DB_POOL_MAX=20
DB_POOL_MIN=2

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=super-secret-jwt-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=super-secret-refresh-key
JWT_REFRESH_EXPIRES_IN=7d
```

### 5. `docker-compose.yml` (Özet Taslak)

Bu konfigürasyon, backend ekosisteminin nasıl ayağa kalktığını kısaca özetler:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:8-alpine
    command: redis-server --appendonly yes
    ports:
      - '6379:6379'

  app:
    build:
      context: .
      target: production
    ports:
      - '${PORT}:${PORT}'
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
```

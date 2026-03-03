# 🔐 Production Deployment Rehberi

Bu rehber, Trivexa Backend'in production ortamına güvenli şekilde dağıtılması için gerekli adımları içerir.

---

## 1. SSL/TLS Yapılandırması

### Seçenek A: Reverse Proxy (Önerilen)

Nginx veya Caddy arkasında çalıştırın. SSL sertifikasını reverse proxy yönetir.

```nginx
# /etc/nginx/sites-available/trivexa
server {
    listen 443 ssl http2;
    server_name api.trivexa.com;

    ssl_certificate /etc/letsencrypt/live/api.trivexa.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.trivexa.com/privkey.pem;

    # WebSocket desteği
    location /presence {
        proxy_pass http://localhost:3500;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # REST API
    location / {
        proxy_pass http://localhost:3500;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Seçenek B: Cloudflare

DNS'i Cloudflare üzerinden yönlendirin. Cloudflare otomatik SSL sağlar (Full Strict modu önerilir).

---

## 2. Database Backup Stratejisi

### Otomatik Günlük Backup (pg_dump + cron)

```bash
#!/bin/bash
# /opt/trivexa/backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/trivexa/backups"
DB_NAME="trivexa_production"
DB_USER="trivexa_prod_user"

mkdir -p $BACKUP_DIR

# Compressed backup
pg_dump -U $DB_USER -d $DB_NAME -Fc > $BACKUP_DIR/trivexa_$DATE.dump

# 30 günden eski backup'ları sil
find $BACKUP_DIR -name "*.dump" -mtime +30 -delete

echo "✅ Backup completed: trivexa_$DATE.dump"
```

**Crontab (Her gece 03:00):**

```bash
0 3 * * * /opt/trivexa/backup.sh >> /var/log/trivexa-backup.log 2>&1
```

### Managed Database Backup

AWS RDS veya DigitalOcean Managed DB kullanıyorsanız otomatik backup zaten aktiftir.

---

## 3. Structured Logging (Winston)

Mevcut `Logger` sınıfı NestJS'in dahili logger'ını kullanıyor. Production'da JSON formatında log çıktısı için `winston` veya `pino` entegrasyonu önerilir:

```bash
npm install winston nest-winston
```

`main.ts`'e eklenecek:

```typescript
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const app = await NestFactory.create(AppModule, {
  logger: WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
      }),
    ],
  }),
});
```

> **Not:** Bu entegrasyon opsiyoneldir. Mevcut NestJS Logger çoğu senaryo için yeterlidir.

---

## 4. Checklist: Production'a Çıkmadan Önce

- [ ] `.env.production` içindeki tüm `CHANGE_ME` değerlerini gerçek değerlerle değiştir
- [ ] JWT secret'ları en az 64 karakter uzunluğunda olmalı
- [ ] `CORS_ORIGIN` sadece frontend domain'ini içermeli
- [ ] `BCRYPT_SALT_ROUNDS` minimum 12 olmalı (`.env.production`'da 12 set edildi)
- [ ] Database kullanıcısı minimum yetki prensibine uygun olmalı
- [ ] Redis şifre koruması aktif olmalı (production'da)
- [ ] SSL/TLS aktif olmalı (Nginx veya Cloudflare)
- [ ] Backup cron job'u test edilmeli
- [ ] `npm run build` başarıyla tamamlanmalı
- [ ] `docker-compose up -d` ile container'lar sağlıklı başlamalı
- [ ] `/api/v1/health` endpoint'i `{ status: "ok" }` dönmeli

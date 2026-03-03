# 🔄 API Versiyonlama Stratejisi

Bu belge, Trivexa Backend API'sinin gelecekteki sürüm geçişlerini nasıl yöneteceğini tanımlar.

---

## Mevcut Durum

- **Aktif Sürüm:** `v1`
- **Global Prefix:** `/api/v1` (`main.ts` → `app.setGlobalPrefix('api/v1')`)
- **Tüm Controller'lar:** `/api/v1/{resource}` altında çalışıyor

---

## Versiyonlama Yöntemi: URI-Based

NestJS'in yerleşik `@nestjs/common` versiyonlama mekanizması kullanılır:

```typescript
// main.ts
import { VersioningType } from '@nestjs/common';

app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: '1',
  prefix: 'api/v',
});
```

### Controller'da Kullanım

```typescript
// v1 — Mevcut
@Controller({ path: 'users', version: '1' })
export class UsersControllerV1 { ... }

// v2 — Gelecek (breaking change varsa)
@Controller({ path: 'users', version: '2' })
export class UsersControllerV2 { ... }
```

### URL Yapısı

| Sürüm | URL                 |
| :---- | :------------------ |
| v1    | `GET /api/v1/users` |
| v2    | `GET /api/v2/users` |

---

## Ne Zaman v2 Oluşturulmalı?

- ❌ Yeni bir endpoint eklemek → v2 **gerekmez** (v1'e eklenebilir)
- ❌ Opsiyonel field eklemek → v2 **gerekmez** (geriye dönük uyumlu)
- ✅ Response yapısı kırılıcı değişiklik → v2 **gerekir**
- ✅ Kimlik doğrulama mekanizması değişikliği → v2 **gerekir**
- ✅ Endpoint kaldırma → Önce deprecation, sonra v2

---

## Deprecation Süreci

1. **Duyuru:** Swagger UI'da `@ApiHeader({ name: 'Deprecated' })` ile işaretle
2. **Deadline:** Minimum 3 ay öncesinden deprecation bildirimi
3. **Sunset Header:** Response'a `Sunset: Sat, 01 Jan 2028 00:00:00 GMT` header'ı ekle
4. **Kaldırma:** Deadline sonrası eski sürümü kaldır

---

> **Not:** Şu an projenin v1 dışında bir sürüme ihtiyacı yoktur. Bu belge, gelecekte breaking change gerektiğinde referans olarak kullanılmak üzere hazırlanmıştır.

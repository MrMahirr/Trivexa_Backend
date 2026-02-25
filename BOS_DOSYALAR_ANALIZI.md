# Proje Dosya ve Mimari Analizi (Boş/Eksik Dosyalar)

Sistem üzerinde yapılan derinlemesine analiz sonucunda, proje mimarisi oluşturulurken ileriye dönük olarak hazırlanmış (iskelet) fakat henüz **içi doldurulmamış (0 bayt olan) toplam 172 dosya** tespit edilmiştir. Hiçbir klasör tamamen boş değildir, ancak içindeki dosyalar kod barındırmamaktadır.

Aşağıda bu boş dosyaların modüllere göre kritik dağılımı listelenmiştir:

## 1. Ortak Paylaşımlı (Shared) Temel Klasörü
Daha sonradan projeye hizmet edecek genel yapılar için oluşturulmuş iskeletler:
- `src/shared/audit` (audit.helpers.ts, audit.module.ts, vb.)
- `src/shared/events` (Event bus yapısı, notification handlers vb.)
- `src/shared/files` (S3 yükleme sağlayıcısı, dosya doğrulayıcıları vb.)
- `src/shared/notifications` (Bildirim fabrikası ve mantığı vb.)
- `src/shared/security` (Özel şifreleme, hız sınırı, token ve şifre kuralları servisleri vb.)
- `src/shared/errors` ve `src/shared/dto` (Pagination ve özel domain error sınıfları).

## 2. Modüller (Modules)
Şu anda API üzerinde aktif hizmet vermediği veya kısmen hizmet verdiği halde eksik UseCase ve iş mantığı barındıran modül dosyaları:

### Audit & Security Logs
- `audit.controller.ts`, listeleme use-case'i ve log repository'leri tamamen boş durumdadır (`src/modules/audit/`).

### Auth (Kimlik Doğrulama)
- Sistemde genel Auth yürütülse de; zorunlu şifre değiştirme (`force-change-password.usecase.ts`), oturum yenileme (`refresh-token.usecase.ts`), çıkış (`logout.dto.ts`) gibi ileri düzey güvenlik senaryoları boştur.

### İstemci (Clients)
- İstemciler için portal girişi (`client-portal-login.dto.ts`), şifre sıfırlama linki oluşturma (`issue-client-access-link.usecase.ts`) gibi müşteri portalı giriş/kurulum altyapısı tanımlanmış ancak içi boştur.

### Sözleşmeler, Toplantılar ve Bildirimler (Contracts, Meetings, Notifications)
- `src/modules/contracts`: Sözleşme oluşturma, güncelleme ve biten sözleşmeleri listeleme UseCase ve altyapıları tamamen boş.
- `src/modules/meetings`: Toplantıdan bilet oluşturma, toplantı rotaları (update, create) boş.
- `src/modules/notifications`: Bildirimleri listeleme veya okundu işaretleme servisleri tamamen boş.

### Projeler, Roller, Görevler, Kullanıcılar
- **Projeler:** Github url ekleme, istemci atama (assign-client) vs.
- **Roller / RBAC:** Yeni rol oluşturma (`create-role.usecase`), izin atama(`assign-permissions.usecase`) yapıları boş. Sadece mevcut veritabanı tohumları (seed) ile limitli işlem yapılıyor.
- **Zaman Takibi (Time Tracking):** Timer başlatma/durdurma veya iptal etme UseCase ve DTO işlemleri boş bulunmakta.
- **Kullanıcılar:** Departman/Rol değiştirme, kullanıcı listesini export (dışa aktarma) yapısı boş.

## 3. Middleware, Pipes & Config (Core Katmanları)
- Özel Hata Yakalayıcılar: `http-exception.filter.ts`
- Özel Katmanlar: `logger.middleware.ts`, `request-id.middleware.ts`, `request-ip.middleware.ts` 
- Pipe (Doğrulama Araçları): `parse-uuid.pipe.ts`, `validation.pipe.ts`
- Ayarlar: `storage.config.ts`, `swagger.config.ts`

---

## Özet ve Aksiyon Planı
Yukarıdaki modüller incelediğimizde Clean Architecture prensibiyle dosyaların **isimlerinin oluşturulduğunu** (Örn: `update-github-url.usecase.ts`) ancak **mantığının (kodlamasının) henüz yazılmadığını** görüyoruz.

Projenizi tam teşekküllü production aşamasına getirebilmek (FAZ'ların haricinde) veya yeni özellikler eklemek (örneğin Dosya Yüklemeleri (S3), Müşteri Portalı yetkilendirmesi, Zaman Takibi vb.) istiyorsanız bu dosyalardan işinize yarayacak olanları seçerek **yeni FAZ'lar** veya görevler planlamamız gerekecektir.

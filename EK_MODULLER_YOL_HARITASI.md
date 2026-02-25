# Trivexa Backend - Eksik Modüller Yol Haritası (Faz 29 - Faz 34)

Bu yol haritası, proje mimarisinde oluşturulmuş ancak içi boş bırakılmış (`0 bayt` boyutunda olan) **172 dosyanın** kodlanarak projeye tam entegre edilmesi için hazırlanmıştır. Geliştirme süreci, birbirine bağımlı olan modüllerden başlayarak daha bağımsız özelliklere doğru (Aşağıdan Yukarıya - Bottom-Up) ilerleyecek şekilde yapılandırılmıştır.

---

## 🟣 FAZ 29: Ortak Altyapı ve Sistem Logları (Shared & Audit)
**Öncelik:** Çok Yüksek | **Bağımlılık:** Temel Altyapı (Core)

1. **Shared (Ortak) Klasörünün Kodlanması**
   - [x] Hata Sınıfları (Errors): `conflict.error.ts`, `forbidden.error.ts`, `not-found.error.ts`
   - [x] Ortak DTO'lar: `api-response.dto.ts`, `page.dto.ts`, `date-range.dto.ts` (Pagination yapıları)
   - [x] Güvenlik Fonksiyonları: `encryption.service.ts`, `password-policy.ts` (Şifre kuralları), `token.service.ts`
2. **Bildirim Fabrikası (Notification Factory & Events)**
   - [x] `event-bus.module.ts` ve event sabitlerinin (constants) tanımlanarak uygulamanın asenkron olay fırlatma altyapısının kurulması.
3. **Audit (Sistem Logları)**
   - [x] `audit-log.entity.ts`, `audit.rules.ts` entegrasyonu.
   - [x] Tüm kritik işlemlerin (`CREATE`, `UPDATE`, `DELETE`) veritabanına kayıt edileceği `audit-log.repository.ts` yazılması.
   - [x] `list-audit-logs.usecase.ts` ve `audit.controller.ts` ile admin paneline log akışının sağlanması.

---

## 🔵 FAZ 30: Gelişmiş Kimlik Doğrulama ve RBAC (Auth & Roles)
**Öncelik:** Çok Yüksek | **Bağımlılık:** Temel Auth, Faz 29

1. **Auth (Gelişmiş İşlemler)**
   - [x] Güvenli Oturum Kapatma (`logout.dto.ts` + Redis Blacklist implementasyonu).
   - [x] Token Yenileme (`refresh-token.usecase.ts` + `refresh.dto.ts`).
   - [x] Yönetici eliyle zorunlu şifre değiştirme (`force-change-password.usecase.ts`).
2. **Kullanıcı Yönetimi (Users)**
   - [x] Kullanıcıların departmanlarını değiştirmesi (`change-department.usecase.ts`).
   - [x] Excel/CSV olarak Kullanıcı Dışa Aktarımı (`export-users.usecase.ts`).
3. **RBAC Geliştirmeleri (Roller)**
   - [x] Dinamik Rol Oluşturma (`create-role.usecase.ts`) ve Güncelleme (`update-role.usecase.ts`).
   - [x] Yetkileri Rol ile eşleme (Permission Assignment): `assign-permissions.usecase.ts` ve controller yapısının tamamlanması.

---

## 🟢 FAZ 31: Dosya Yönetimi ve Sözleşmeler (Files & Contracts)
**Öncelik:** Yüksek | **Bağımlılık:** S3/Local Depolama Altyapısı

1. **Dosya Yükleme Altyapısı (Shared Files)**
   - [x] `s3-storage.provider.ts` ile dış bulut entegrasyonu (AWS S3 veya MinIO).
   - [x] Dosya boyut/uzantı validatörlerinin tamamlanması (`file-size.validator.ts`, `file-type.validator.ts`).
2. **Sözleşme Modülü (Contracts)**
   - [x] `contract.entity.ts` ve domain kuralları (`contract.rules.ts`).
   - [x] Sözleşme oluşturma (`create-contract.usecase.ts`) ve durum güncelleme (`update-status.usecase.ts`).
   - [x] Yakında bitecek sözleşmeleri listeleyen raporlama usecase'i (`list-expiring-contracts.usecase.ts`).

---

## 🟡 FAZ 32: İstemci Müşteri Portalı (Client Portal)
**Öncelik:** Orta | **Bağımlılık:** Auth, Users

1. **İstemci İşlemleri (Clients)**
   - Müşterilere sisteme giriş yapabilmeleri için erişim linki gönderme (`issue-client-access-link.usecase.ts`).
   - İstemci kullanıcılarını oluşturma (`create-client-user.usecase.ts` ve `client-user.entity.ts`).
   - İstemci giriş yapısı için DTO ve Controller validasyonları (`client-portal-login.dto.ts`).
2. **Projeler ve İstemci İlişkileri (Projects)**
   - İstemcileri projeye atamak (`assign-client.usecase.ts`).
   - Projenin Github veya harici bağlantılarını güncellemek (`update-github-url.usecase.ts`).

---

## 🟠 FAZ 33: Zaman Takibi, Biletler ve Toplantılar (TimeTracking & Tickets)
**Öncelik:** Orta | **Bağımlılık:** Projeler, Users

1. **Zaman Takibi (Time Tracking)**
   - Zaman çizelgesi modülü kuralları (`time-tracking.rules.ts`).
   - Kronometreyi başlatma (`start-timer.usecase.ts`) ve durdurma (`stop-timer.usecase.ts`).
   - Çalışan bazlı veya proje bazlı girişleri listeleme (`list-entries.usecase.ts`).
2. **Bilet Sistemi (Tickets)**
   - Yeni bilet atama (`assign-ticket.dto.ts`).
   - Bilet onay mekanizmaları (`approve-ticket.usecase.ts`).
3. **Toplantılar (Meetings)**
   - Toplantıyı oluşturma, güncelleme ve domain bazlı testleri (`create-meeting.usecase.ts`, `meeting.rules.ts`).
   - Toplantı tutanaklarından/sonuçlarından direkt Bilet (Ticket) oluşturma (`convert-to-ticket.usecase.ts`).

---

## 🔴 FAZ 34: Bildirim Yönetimi (Notifications)
**Öncelik:** Düşük/Orta | **Bağımlılık:** Event-Bus, Tüm modüller

1. **Uygulama İçi Bildirimler (In-App Notifications)**
   - `notification.entity.ts` oluşturulması ve veritabanı sql mapping'lerinin ayarlanması.
   - Bildirimleri Okundu işaretlemek (`mark-read.dto.ts`, `mark-all-read.dto.ts`).
   - Bildirimleri sayfalayarak listelemek (`list-notifications.query.ts`).
2. **Olay Bağlantıları (Event Handlers)**
   - Daha önce yazılan Sözleşme/Toplantı ve Zaman Takibi işlemlerindeki olayların dinlenerek bu modül üzerinden tetiklenmesi ve WebSocket ile anlık (`notifications-public.service.ts`) istemcilere gönderilmesi.

---

## Geliştirme Önerisi (Nasıl Başlanmalı?)

Eğer bu boş dosyaları derhal tamamhyıp canlı ortama daha hızlı değer katmak isterseniz tavsiyem:

**1. Yeni Bir Klasör Oluşturun:** Bu işleri mevcut tamamlanmış işlerinizin güvenliğini etkilemeden sürdürmek en doğrusudur.
**2. FAZ 29 ile Başlayın:** Çünkü tüm uygulamanın kullanacağı Pagination, Özel Hata sınıfları (Exceptions) ve Event Bus mekanizması FAZ 29'da bulunuyor. Burası yazılmadan diğer kodlar eksik bağımlılık hatası verecektir.
**3. İlgili testlerini E2E'ye ekleyin:** Her Faz bitiminde ilgili klasörlere .spec.ts testlerini yazıp mevcut pipeline'ınızdan (Faz 27'de yaptığımız) geçmesini sağlayın. 

Hangi FAZ’dan (Örn: FAZ 29 - Ortak Altyapı) başlamamı istersiniz? Çekirdek (Core/Shared) modüllerden hemen başlayabilirim.

# 🌟 Faz 35 ve Sonrası - Boş/Taslak Dosyaları Canlandırma Yol Haritası

Bu harita, `BOS_DOSYALAR_ANALIZI.md` dosyasında listelenmiş olan 118 adet "0 byte / Taslak" dosyayı projenin canlı iş akışına bağlamak ve Trivexa Backend'i tam kapsamlı bir ajans yönetim sistemine çevirmek için hazırlanmıştır. 

Mevcut sistemin (Faz 34 dahil) sağlam omurgasının üzerine inşa edilecek bu yeni fazlar öncelik sırasına göre dizilmiştir.

---

## 🟡 FAZ 35: İstemci (Müşteri) Portalı ve Dosya Paylaşımı
**Öncelik:** Çok Yüksek | **Bağlantılı Dosya:** 15+

Bu faz, dış müşterilerin (Client) sadece kendilerine ayırılan, şifreli/linkli kapalı bir portala girmelerini ve yönetimin onlarla dosya (`S3/Shared`) paylaşımlarını yapabilmesini kapsar.

- [ ] **Müşteri Usecase & DTO:**
  - `issue-client-access-link.dto.ts` ve `issue-client-access-link.usecase.ts` (Müşteriye portal girişi için erişim linki verme süreci)
  - `force-change-client-password.usecase.ts` (Müşterinin portala ilk girişte parolasını ayarlaması)
- [ ] **Müşteri Veritabanı:**
  - `client-user.entity.ts`, `client.repository.ts`, `client-users.sql.ts`
  - `clients-public.service.ts` ile dışa açılan endpoint'lerin aktif edilmesi.
- [ ] **Projeler (Müşteri İlişkisi):**
  - Müşteri login olduğunda sadece kendi projesini (`project.entity.ts`, `project.repository.ts`) görmesinin yetkilendirilmesi.

---

## 🟡 FAZ 36: Gelişmiş Zaman & Efor Takibi (Time Tracking)
**Öncelik:** Yüksek | **Bağlantılı Dosya:** 10+

Çalışanların mesai veya proje bazlı ne kadar çalıştığının, duraklatıldığının saniye saniye takip edilmesi. Finansal gider hesaplamanın kalbidir.

- [ ] **Zaman Sayacı Usecase & DTO:**
  - `start-timer.dto.ts`, `stop-timer.dto.ts`, `cancel-time-entry.dto.ts` (Sayacı başlat, durdur, iptal et)
  - `list-time-entries.query.ts` (Kim nerede ne kadar çalıştı listele)
  - `cancel-entry.usecase.ts`
- [ ] **Repository ve Domain:**
  - `time-entry.entity.ts`, `time-entry.repository.ts`, `time-tracking.sql.ts`
- [ ] **Public Bağlantı:** 
  - `time-tracking-public.service.ts`

---

## 🟢 FAZ 37: Toplantılar ve Sözleşme Zekası (Meetings & Contracts)
**Öncelik:** Orta/Yüksek | **Bağlantılı Dosya:** 20+

Sözleşme taslaklarının onay süreçlerini tutmak ve düzenlenen toplantılardan (Meetings) çıkan kararları otomatik birer görev (Ticket) haline dönüştürmek.

- [ ] **Sözleşmeler (Contracts):**
  - `update-contract-status.dto.ts`, `list-contracts.query.ts`
  - `contract.entity.ts`, `contract.repository.ts`, `contracts.sql.ts` ve public servis dosyaları.
- [ ] **Toplantılar (Meetings):**
  - `update-meeting.dto.ts`, `update-meeting.usecase.ts` 
  - `convert-to-ticket.dto.ts` (Toplantı konuşmalarını/notlarını al, 1 tıkla yeni Bilet'e (Ticket) dönüştür)
  - `meeting.entity.ts`, `meeting.repository.ts`, `meetings.sql.ts`

---

## 🟢 FAZ 38: Departman ve Rol Atamaları (HR & RBAC)
**Öncelik:** Orta | **Bağlantılı Dosya:** 10+

Uygulamanın iç (ajans) idamesini kodlara bağlı olmaksızın arayüzden yapmayı sağlar.

- [ ] **Departmanlar:**
  - `create-department.usecase.ts`, `update-department.usecase.ts` (Yeni yazılım departmanı açmak vs)
  - DTO'lar ve sql (`departments.sql.ts`) 
- [ ] **Rol Düzenlemeleri (RBAC):**
  - `rbac.rules.ts`, `change-role.usecase.ts` (Ahmet'i Stajyerlikten Yöneticiliğe almak ve yetkilerini anında DB'den okumak)
- [ ] **Kullanıcılar:**
  - `list-users.query.ts`, `user.entity.ts`

---

## 🔵 FAZ 39: Performans ve Güvenlik Altyapısı (System Core Logs)
**Öncelik:** Düşük/Orta Kodlama Süreci | **Bağlantılı Dosya:** 15+

Arayüze değil, arka planda sunucunun güvende kalmasına hizmet eden dosyalar. Kurumsal projelerde istenen legal zorunluluklardır.

- [ ] **Adli Bilişim / Sistemsel Denetim (Audit Logs):**
  - `audit.helpers.ts`, `audit.service.ts` (Kim, hangi ID ile, hangi tablodan veri sildi? - Redux tarzı history loglama)
- [ ] **Ortak Middleware:**
  - `logger.middleware.ts`, `request-id.middleware.ts` (İstenmeyen IP'leri/hızlı istekleri (rate-limit) ve rotaları global bloklama işlemleri)
  - `http-exception.filter.ts` (Kullanıcıya özel hata mesajı verme)
- [ ] **Enum ve Validation (Doğrulama):**
  - Geriye kalan `transaction-type.enum.ts`, `currency.enum.ts` vb. enumların projenin tamamına uyarlanması.
  - `validation.pipe.ts` sınırlandırmaları.

---

### Sonuç ve Başlangıç Noktası
Bu 5 FAZ (Faz 35-39) birbiriyle sıralı olarak tasarlanmıştır. Ancak şirketinizin şu anki ticari ihtiyacına göre yer değiştirebilirler. 

Önerim: Şirkete anında değer katacak ve en çok eksikliği hissedilen **Müşteri (Client) Portalı (Faz 35)** veya **Çalışma Süreleri (Time Tracking) (Faz 36)** modülünden birisini seçerek hemen kodlamaya geçmemizdir. Seçiminiz hangisidir?

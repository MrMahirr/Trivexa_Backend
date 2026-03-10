# Sistem Mevcut Durum Gereksinim Analizi (Projede Geliştirilmiş Özellikler)

Bu belge, Trivexa Ajans Yönetim Sistemi projesinde **şu anda aktif olarak kodlanmış ve çalışan** özelliklerin detaylı (alt maddeli) gereksinim analizidir.

## 1. Kimlik Doğrulama ve Rol Bazlı Yetkilendirme (Auth & RBAC)

- **1.1. Güvenli Giriş Sistemi:** Personeller ve müşteriler (müşteri paneli) sisteme JWT tabanlı güvenli bir kimlik doğrulama mekanizmasıyla giriş yapabilmelidir. Şifreler Bcrypt algoritmasıyla şifrelenerek veritabanında saklanır.
- **1.2. Rol ve Departman Hiyerarşisi:** Sistem; `CEO`, `Müdür (Yönetici)`, `Muhasebe`, `Çalışan/Personel` ve `Müşteri` olarak temel rollere ayrılmalıdır.
- **1.3. Dinamik Menü ve Rota (Route) Koruması:** Kullanıcılara sadece kendi yetkilerine ve ait oldukları departmanlara uygun menü öğeleri ve sayfalar gösterilmelidir. Yetkisiz API çağrıları 403 Forbidden ile backend üzerinden engellenmelidir.

## 2. Personel ve İnsan Kaynakları Yönetimi

- **2.1. Personel Listesi ve Profilleri:** Tüm personeller gelişmiş bir tablo üzerinde listelenebilmeli; ad, soyad, iletişim, departman (alt departman) ve rol bilgileri ile filtrelenebilmelidir.
- **2.2. Alt Departman (Sub-department) Sistemi:** Personeller yalnızca ana departmanlara (Örn: Yazılım) değil, alt rollere (Örn: Frontend, Backend) atanabilmeli ve yöneticiler kendi departmanlarındaki kişileri takip edebilmelidir.
- **2.3. İzin Talebi ve Yönetimi (Leave Management):** Personeller yıllık mazeret veya sağlık izni talepleri oluşturabilmelidir.
  - _2.3.1._ Taleplerin başlangıç, bitiş tarihleri, gün sayısı ve nedenleri sisteme işlenmelidir.
  - _2.3.2._ Yöneticiler gelen izin taleplerini `Onaylandı` veya `Reddedildi` durumlarına çekebilmelidir.

## 3. Müşteri ve Sözleşme Yönetimi

- **3.1. Firma ve İletişim Kişileri:** Müşteriler (firmalar) ve onlara ait spesifik iletişim kişileri/kullanıcı hesapları sisteme kaydedilebilmelidir.
- **3.2. Müşteri Paneli Erişimi:** Müşteriler kendi projelerinin, finansal dökümlerinin, bildirdikleri bug'ların ve toplantılarının özetini görebilecekleri özel, kısıtlı bir müşteri paneline giriş yapabilmelidir.
- **3.3. Sözleşme Havuzu (Contracts):** Müşteri ve ajans arasındaki fiyat teklifi, NDA, bakım-onarım veya proje sözleşmeleri PDF formatında yüklenerek sistemde arşivlenmeli; başlangıç ve bitiş tarihleri takip edilebilmelidir.
- **3.4. Görüşme (Meetings) Takibi:** Müşteri ile yapılan toplantıların notları, departman etiketleri (audience_type) ve özet bilgileri sistem üzerinde tutulmalıdır.

## 4. Proje ve Görev (Task) Yönetimi

- **4.1. Projelerin Yaşam Döngüsü:** Yeni projeler oluşturulmalı, müşteri atanmalı, başlangıç/bitiş tarihleri ile mevcut durumu (Planlama, Devam Ediyor, Tamamlandı, Beklemede) takip edilebilmelidir.
- **4.2. Kanban Görev Yönetimi (Tasks):** Projelerin altındaki işler "Görev" olarak açılmalı, To Do, In Progress, Done gibi Kanban statülerinde izlenebilmelidir.
- **4.3. Görev Atamaları (Assignees):** Görevlere spesifik personeller (`task_assignees`) atanabilmeli ve öncelik dereceleri (Düşük, Normal, Yüksek, Kritik) belirlenebilmelidir.

## 5. Üretim Ekibi (Yazılım ve Tasarım) Süreçleri

- **5.1. GitHub Entegrasyonu (Code Processes):** Projeler GitHub repoları (`repository_url`, `access_token`) ile eşleştirilebilmelidir.
  - _5.1.1._ Son atılan Commit'ler (Branch bilgisi ile), açık olan Issue'lar ve Pull Request'ler gerçek zamanlı olarak sistem üzerinden çekilip listelenebilmelidir.
- **5.2. Tasarım Onay Süreçleri (Design Processes):** Tasarım (Kreatif) ekibi için işlerin Tasarım Bekliyor, İç Onay, Müşteri Onayı, Revize veya Tamamlandı aşamalarında kanban şeklinde taşınabilmesine izin veren bir Design Process altyapısı bulunmalıdır.

## 6. Süre Takibi (Time Tracker) ve Performans Analizi

- **6.1. Sayaç Mekanizması:** Personeller çalıştıkları proje, görev üzerinde ve yaptıkları iş tanımıyla bir sayacı canlı olarak başlatıp durdurabilmelidir.
- **6.2. Zaman Kayıtları (Time Entries):** Toplam süre sistem tarafından (Server Timestamp ile) güvenli biçimde hesaplanarak veritabanına loglanmalıdır. Yanlış kayıtlar ancak "İptal (Cancel)" statüsüne çekilebilmelidir, silinemez.
- **6.3. Performans Metrikleri:** Bir projenin üzerine harcanan toplam süre, departmanların iş gücü dağılımı gibi "Performans ve Aktivite" verileri, üst yönetim için tablo ve grafiklerle (Activity Feed) raporlanabilmelidir.

## 7. Gelişmiş Finans, Ön Muhasebe ve Defteri Kebir Modülü

- **7.1. Fatura Yönetimi (Invoices):** Müşterilere kesilen faturalar, alt kalemleriyle (Invoice Items - miktar, birim fiyat), Vergi/KDV oranlarıyla (Tax Rate) ve Toplam Bakiye (Subtotal/Total) şeklinde sistemde oluşturulabilmelidir.
- **7.2. Tahsilat/Ödeme Ekleme (Payments):** Oluşturulan faturaya dair tahsilatlar; ödeme tarihi, ödeme metodu (hesap vs.), fiş veya dekont URL'si (`receipt_url`) eklenerek parçalı ya da tam ödeme şeklinde işlenebilmelidir. Fatura kalan hesabı otomatik hesaplanır.
- **7.3. Giderler (Expenses) & Masraf Fişleri:** Personeller şirket adına harcadığı yemek, taksi veya yazılım hizmet bedellerini sisteme girip yönetici onayına (Pending -> Approved) sunabilmelidir.
- **7.4. Defteri Kebir (Ledger) & Çift Taraflı Muhasebe:** Nakit kasası, banka hesapları veya alacak/verecek döngüsü detaylı `ledger_accounts` ve fiş/mahsup işlemleri tarzı `ledger_entries` üzerinden mali tablolarda takip edilebilir olmalıdır.
- **7.5. Kampanyalar (Campaigns) Yönetimi:** Ajansın üstlendiği müşteri projelerine ait bütçeli kampanyalar (Platform: Google, Meta vd.) bütçe harcamaları, başlangıç ve hedeflerle sisteme kayıt edilebilmelidir.

## 8. Destek Biletleri (Tickets) ve Müşteri Talepleri Yönetimi

- **8.1. Ticket (Destek) Yönetimi:** Personeller veya müşteriler sistemsel / süreçle ilgili Destek Biletleri açabilmeli; bu biletlerin Durum, Aciliyet (Priority) ve Atanan Kişi (Assignee) eşleştirmeleri yapılabilmelidir.
- **8.2. Müşteri Talepleri Onay Döngüsü (Client Portal Requests):** Müşteri tarafından veya temsilci üzerinden oluşturulan istekler (Bug, Feature, Other) önce temsilcinin Onay veya Red (Approval Status) kararına düşmeli, ardından geliştirme aşamasına (Stage Type) ilerletilmelidir.

## 9. Sistem İzlenebilirliği, Loglar ve Bildirimler

- **9.1. WebSocket Destekli Canlı Event Audit:** Sistemde yapılan kritik değişiklikler (örneğin müşteri faturasının silinmesi, bir iş sürecinin değişimi) anlık olarak JSON Payload Diff'leri (eski ve yeni verinin kıyaslanması) ile kaydedilmeli ve WebSocket bağlantısı kuran yetkilendirilmiş istemcilere canlı yayınlanmalıdır.
- **9.2. Değiştirilemez Denetim İzleri (Audit Logs):** Tüm hareketler Kullanıcı ID, kaynak adı, eylem (action) bilgileri ile geri döndürülemez formatta (`audit_logs`) mühürlenmelidir.
- **9.3. Sistem İçi Canlı Bildirimler (Notifications):** Yeni bir görev atandığında, sözleşme vakti geldiğinde ya da bir talep müşteri tarafından güncellendiğinde sağ tarafta açılan ve "Okundu" yapılabilen canlı bildirim pop-up'ları sunulmalıdır.

# Trivexa Ajans Yönetim Sistemi - Gereksinim & Proje Durumu Karşılaştırması

Bu belge, `gereksini.docx` dokümanında yer alan talepler ile projenin mevcut kod tabanı ve veritabanı şeması (migration'lar ve modüller) arasındaki farklılıkları listelemektedir.

## ❌ Gereksinim Analizinde OLAN Ama Projede OLMAYANLAR (Eksikler / Tamamlanmamışlar)

1. **Maaş Bilgisinin Şifrelenmesi (Madde 15.1):**
   - _Doküman:_ Personellerin maaşlarının veritabanında "şifrelenmiş (encrypted)" tutulması gerektiği belirtiliyor.
   - _Mevcut Durum:_ Backend veritabanında maaş bilgisi için özel bir şifreleme mekanizması veya bu bilgiyi tutacak detaylı bir sütun aktif olarak kullanılmıyor. Personel tablolarında standart bir şekilde saklanıyor olabilir.

2. **Müşteri Paneli 'Talep/Bug Oluşturma' Arayüzü (Madde 34.3 & 35):**
   - _Doküman:_ Müşterilerin kendi panelleri üzerinden hata bildirimi ve talep oluşturabilmesi isteniyor.
   - _Mevcut Durum:_ Backend tarafında müşteri talepleri (`client_portal_requests`) için tablolar ve API'ler hazır olmasına rağmen, Frontend'de müşteri paneli içerisindeki "Taleplerim" veya "Yeni Talep" sayfası henüz geliştirilmemiş.

3. **Süresi Dolmaya Yaklaşan Sözleşmeler için "Kritik Uyarı" (Madde 47):**
   - _Doküman:_ Süresi dolmaya 30 gün kalan sözleşmeler için Operasyon Yönetimi panelinde kritik uyarı gösterilmesi listelenmiş.
   - _Mevcut Durum:_ Sözleşmeler (`contracts`) modülü yapılmış olsa da, belirgin bir "Kritik Uyarı" / Alarm bildirim arayüzü ana panellerde henüz yok.

4. **Görüşmelerden Otomatik Talep / Görev Üretme (Action Items) (Madde 41.4):**
   - _Doküman:_ Müşteri temsilcisinin girdiği görüşme (`meeting`) notlarından tek bir tuşla direkt olarak "Yeni İstek (Feature)" veya "Bug" üretilmesi ve bunların görüşme ID'si ile arka planda izlenebilmesi (Traceability) isteniyor.
   - _Mevcut Durum:_ Backend tarafında onaylanan müşteri taleplerinden manuel/otomatik toplantı üretme (veya tam tersi) mekanizmaları kısmen kodlanmış olsa da, Frontend tarafında temsilcinin tek tuşla action item oluşturma workflow'u bulunmuyor.

5. **Onay Mekanizması ve Müşteri Temsilcisi Kontrol Paneli (Madde 38.4 & 41.7):**
   - _Doküman:_ Üretim ekibi (Örn: Developer) bir görevi bitirdiğinde işin doğrudan müşteriye gitmeyip Müşteri Temsilcisinin bir "Ön Onay Kontrol Paneli"ne düşmesi süreci listelenmiş.
   - _Mevcut Durum:_ Görev (`task`) akışlarında genellikle görev bitince doğrudan tamamlanıyor, araya giren zorunlu ve izole bir "Temsilci Onayı" workflow adımı ve UI ekranları eksik.

6. **Tanıtım Sitesi Demo Talep / Email.JS Entegrasyonu (Madde 39, 40, 43):**
   - _Doküman:_ Web sitesi üzerinden Demo / İstek talebi formunun Email.JS vasıtasıyla e-posta olarak aktarılması belirtilmiş.
   - _Mevcut Durum:_ Bu entegrasyon formları ve Email.JS altyapısı Backend'den bağımsız olduğu için ana projede tam entegre çalışmıyor.

7. **Role Göre Sıkı Data İzolasyonu (Madde 14 & 38.1):**
   - _Doküman:_ Yöneticilerin SADECE kendi departmanındaki kişileri görmesi, Müşteri Temsilcilerinin SADECE kendi müşterilerini görmesi (Data Isolation) kuralı.
   - _Mevcut Durum:_ Yöneticiler genelde tüm projeleri frontend üzerinden filtreleyerek görebiliyor. Katı (strict) bir veritabanı row-level veri izolasyonu (RLS) veya endpoint kısıtı yerine daha yüzeysel, client-side ve role dayalı bir yetkilendirme mevcut.

---

## ⭐ Projede OLAN Ama Gereksinim Analizinde OLMAYANLAR (Fazladan Eklenen Ekstralar)

1. **Gelişmiş Finans & Çift Taraflı Muhasebe Modülü:**
   - _Doküman:_ Yalnızca fatura, bütçe, ödenen miktar ve maliyetlerin kısaca takip edilmesi yazıyor.
   - _Mevcut Durum:_ Sistemde _Defteri Kebir (Ledger)_, _Çift Taraflı Muhasebe (Double-entry)_, _Banka Mutabakatı (Bank Reconciliation)_, _Vergi / KDV (Tax Declaration)_ hesaplamaları ve makbuz çıktıları içeren kurumsal ölçekli bir ön muhasebe altyapısı inşa edilmiş.

2. **Kod ve Tasarım Süreçleri Yönetimi (Code & Design Processes):**
   - _Mevcut Durum:_ Projelere özel GitHub entegrasyonu (`project_github_integrations`), güncel commit'leri çekme, pull-request takip etme (Code Processes) ve Kreatif ekip için bir Kanban tablosu şeklinde interaktif tasarım onay aşamaları (Design Processes) eklenmiş.

3. **Kampanya Yönetimi (Campaigns):**
   - _Mevcut Durum:_ Ajansın yönettiği reklam veya sosyal medya kampanyalarını platform (Instagram, Google vb.), bütçe, hedefler ve statü bazında takip edebilmesi için tamamen yeni bir Kampanya Modülü (`campaigns` tablosu) kurulmuş.

4. **İzin Yönetimi Modülü (Leave Management):**
   - _Doküman:_ İK işlemlerinden yüzeysel bahsedilmiş, yıllık/mazeret izni modülü geçmiyor.
   - _Mevcut Durum:_ Personellerin izin taleplerini oluşturduğu, süre belirttiği (gün), yöneticilerin onaylayıp reddettiği gelişmiş bir `leave_requests` altyapısı (`1773600000000_create_leave_requests.ts`) ve Yönetim arayüzü eklenmiş.

5. **Alt Departman (Sub-department) Atamaları:**
   - _Mevcut Durum:_ Kullanıcıları sadece düz rollerle ayırmanın ötesinde, alt departmanlara bölen ve esnek yapılar kurmayı sağlayan geniş bir "Department Assignments" ve sub-department modülü kodlanmış.

6. **İleri Seviye Audit Log ve Canlı WebSocket Yayını:**
   - _Doküman:_ Kritik işlemlerin basitçe "değiştirilemez log" olarak tutulması maddesi var.
   - _Mevcut Durum:_ Bu özellik çok gelişmiş bir noktaya taşınmış. Redis ve WebSocket destekli, JSON Payload diff'leri ile (hangi alan, eski değerinden yeni değerine nasıl değişmiş) detayları anlık (canlı) aktaran kurumsal bir Event Sourcing (Audit Log) altyapısına dönüştürülmüş.

7. **Performans Takip Ekranları (Performance & Analytics):**
   - _Mevcut Durum:_ Personellerin time tracker verilerine, projelere ayırdığı sürelere ve tamamladıkları görevlere dayalı istatistiksel performans metrikleri ile kapasite analizlerinin yapıldığı modüller eklenmiş.

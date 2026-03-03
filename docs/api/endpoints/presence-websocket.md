# WebSocket API Deneyim Kılavuzu: Active Users Presence

Bu doküman, Trivexa projesinin **Gerçek Zamanlı Aktif Kullanıcılar (Real-Time Presence)** sistemi için Frontend takımının WebSocket sunucusuna nasıl bağlanacağını açıklar.

## 1. Bağlantı ve Authentication (Kimlik Doğrulama)

Özellik tamamen `/presence` namespace'i (ad uzayı) üzerinden çalışır ve JWT tabanlı `WsJwtAuthGuard` ile güvenlik altına alınmıştır.

**Endpoint (URL):**  
`ws://localhost:3500/presence` (veya sunucu URL'iniz)

**Client-side Örneği (Socket.io Client):**

```javascript
import { io } from 'socket.io-client';

const token = 'YOUR_ACCESS_TOKEN'; // localStorage vb.'den gelen Bearer JWT

// Auth handshake param olarak token gönderilir
const socket = io('http://localhost:3500/presence', {
  auth: { token: token },
  transports: ['websocket'], // polling yerine websocket'e zorlanır
});

socket.on('connect', () => {
  console.log('Sunucuya bağlanıldı. ID:', socket.id);
});

socket.on('connect_error', (err) => {
  console.error('Authentication Hatası:', err.message); // Unauthorized
});
```

> **ÖNEMLİ:** `WsJwtAuthGuard`, bağlantı başlarken (handshake sırasında) `auth.token` alanını arar. Eğer token geçersizse, süresi dolmuşsa veya hiç yoksa `Unauthorized` hatası fırlatılarak ağ (socket) anında kapatılır.

---

## 2. Odaya Katılım (Join Project)

Kullanıcı React/Next vb. uygulamasında belli bir projenin sayfasına (örn: `/projects/:projectId`) girdiğinde bu event tetiklenmelidir.

- **Event Adı:** `joinProject`
- **Payload:**

```json
{
  "projectId": "UUID-STRING"
}
```

**Client Kodu:**

```javascript
// React useEffect gibi bir life-cycle içinde tetiklenir:
socket.emit('joinProject', { projectId: 'uuid-from-url' });
```

---

## 3. Odayı Terk Etme (Leave Project)

Kullanıcı o projeden çıktığında ya da sekme kapatıldığında sistemin temizlik (Memory cleanup) yapabilmesi için haber verilmelidir. Beklenmedik kopmalar (internet kesintisi) backend tarafından anında O(1) maliyetle otomatik halledilmektedir.

- **Event Adı:** `leaveProject`
- **Payload:**

```json
{
  "projectId": "UUID-STRING"
}
```

**Client Kodu:**

```javascript
socket.emit('leaveProject', { projectId: 'uuid-from-url' });
```

---

## 4. Broadcast Event'i Dinleme (Active Users Update)

Bir projeye aktif bir şekilde giren, çıkan veya sekmeyi kapatan biri olduğunda, sadece o projedeki **tüm çevrimiçi kullanıcılara** (odaya) aşağıdaki event ve payload yollanır.

- **Dinlenecek Event Adı:** `activeUsersUpdate`

**Örnek Yakalanan Payload (Server'dan Client'a Dönen Veri):**

```json
{
  "projectId": "123e4567-e89b-12d3-a456-426614174000",
  "activeUsers": [
    {
      "userId": "uuid-for-admin",
      "email": "admin@trivexa.com"
    },
    {
      "userId": "uuid-for-manager",
      "email": "manager@test.site"
    }
  ]
}
```

**Client Kodu:**

```javascript
socket.on('activeUsersUpdate', (data) => {
  // Frontend UI'yi (Görüntülenen Kullanıcı Çemberleri vs.) güncelle
  console.log('Şu an bu projeyi inceleyen kişiler:', data.activeUsers);
});
```

---

## Limitler ve Çoklu Sekme (Multi-Tab) Davranışı

- Bir kullanıcı aynı projeyi arayüzde 3 farklı tab'da (sekmede) açık bırakırsa, "activeUsersUpdate" payload'unda sadece bir kez `userId` görünür (Sistem çoğullamayı önler).
- 3 sekmeden 1'ini dahi kapatsa, sistem hâlâ diğer 2 sekmeyi gördüğü için kendisini "odadan" çıkartmaz; array'den eksiltilmez.
- Bilgisayarı tamamen kapattığında backend milisaniyeler içerisinde disconnect olayından durumu anlar ve oda üyesini activeUsers array listesinden temizleyerek diğer bağlantılara haber verir.

# 🔌 Trivexa WebSocket — Frontend Entegrasyon Rehberi

Bu rehber, frontend geliştiricilerin **Active Users Presence** sistemine nasıl bağlanacağını adım adım anlatır.

---

## 1. Kurulum

```bash
npm install socket.io-client
```

---

## 2. Bağlantı ve Proje Odasına Katılım

```typescript
import { io, Socket } from 'socket.io-client';

// 1. Backend URL + Namespace
const PRESENCE_URL = 'http://localhost:3500/presence';

// 2. JWT Token (Login sonrası localStorage'dan alınır)
const token = localStorage.getItem('accessToken');

// 3. Bağlantıyı kur
const socket: Socket = io(PRESENCE_URL, {
  auth: { token },
  transports: ['websocket'], // polling yerine direkt WebSocket
  reconnection: true, // kopunca otomatik yeniden bağlan
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});

// 4. Bağlantı başarılı → Projeye katıl
socket.on('connect', () => {
  console.log('✅ Presence bağlantısı kuruldu:', socket.id);

  const projectId = 'uuid-from-url-params'; // React Router veya Next.js params
  socket.emit('joinProject', { projectId });
});

// 5. Aktif kullanıcı listesi güncellendiğinde
socket.on('activeUsersUpdate', (data) => {
  console.log('👥 Aktif Kullanıcılar:', data.activeUsers);
  // React: setActiveUsers(data.activeUsers)
  // data.activeUsers = [{ userId: "...", email: "..." }, ...]
});

// 6. Hata yakalama
socket.on('connect_error', (err) => {
  console.error('❌ Bağlantı hatası:', err.message);
  // Token süresi dolmuşsa yeniden login'e yönlendir
});

socket.on('exception', (err) => {
  console.error('❌ WebSocket Exception:', err);
});
```

---

## 3. Sayfa Değiştiğinde Odadan Çıkış (React)

```typescript
import { useEffect } from 'react';

function ProjectPage({ projectId }: { projectId: string }) {
  useEffect(() => {
    // Odaya katıl
    socket.emit('joinProject', { projectId });

    // Cleanup: Sayfa değiştiğinde odadan çık
    return () => {
      socket.emit('leaveProject', { projectId });
    };
  }, [projectId]);

  // ...render
}
```

---

## 4. API Response Formatı (Tüm REST Endpoint'ler)

Tüm REST yanıtları aşağıdaki standart formatta döner:

```json
{
  "success": true,
  "statusCode": 200,
  "data": { ... },
  "timestamp": "2026-03-03T20:00:00.000Z",
  "path": "/api/v1/projects",
  "requestId": "uuid-v4"
}
```

**Hata durumunda:**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "code": "VALIDATION_FAILED",
  "details": { ... },
  "timestamp": "2026-03-03T20:00:00.000Z",
  "path": "/api/v1/projects"
}
```

---

## 5. Hızlı Referans

| Özellik          | Detay                                  |
| :--------------- | :------------------------------------- |
| **Backend URL**  | `http://localhost:3500`                |
| **API Prefix**   | `/api/v1`                              |
| **Swagger Docs** | `http://localhost:3500/api/docs`       |
| **WebSocket NS** | `http://localhost:3500/presence`       |
| **Auth Header**  | `Authorization: Bearer <JWT_TOKEN>`    |
| **WS Auth**      | `io({ auth: { token: "JWT_TOKEN" } })` |
| **CORS Origin**  | `http://localhost:3000` (varsayılan)   |

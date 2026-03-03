# 📝 Audit Logs API

**Base URL:** `/api/v1/audit`

Sisteme giren kullanıcıların gerçekleştirdiği kritik işlemleri (login, fatura kesimi, proje silimi vb.) geriye dönük loglayan denetim mekanizmasıdır. Sadece yönetici rolüne sahip hesaplar görebilir.

| Method | Endpoint | Description                                  | Roles |
| :----- | :------- | :------------------------------------------- | :---- |
| `GET`  | `/`      | List all system audit logs (with pagination) | ADMIN |

## 🛡️ Güvenlik (RolesGuard)

Bu endpoint **kesinlikle** sadece `@Roles(Role.ADMIN)` ile tetiklenebilir. Diğer roller `403 Forbidden` alacaktır.

## Usage Examples

### Fetch Audit Logs (Paginated)

**GET** `/api/v1/audit?page=1&limit=50&action=CREATE_INVOICE`

```json
{
  "data": [
    {
      "id": "uuid...",
      "userId": "uuid...",
      "action": "CREATE_INVOICE",
      "resource": "invoices",
      "resourceId": "uuid...",
      "oldData": {},
      "newData": { "total": 1500 },
      "ipAddress": "192.168.1.1",
      "createdAt": "2024-03-30T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "itemCount": 1,
    "pageCount": 1,
    "hasPreviousPage": false,
    "hasNextPage": false
  }
}
```

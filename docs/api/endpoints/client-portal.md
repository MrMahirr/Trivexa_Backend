# 🌐 Client Portal API

**Base URL:** `/api/v1/portal`

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/login` | Client login to portal | Public |
| `GET` | `/dashboard` | Get client dashboard data | Client |
| `GET` | `/requests` | List client portal requests | Client |
| `POST` | `/requests` | Create a new client portal request | Client |

## Usage Examples

### Client Login
**POST** `/api/v1/portal/login`
Request:
```json
{
  "email": "client@example.com",
  "password": "securePassword123"
}
```

### Dashboard
**GET** `/api/v1/portal/dashboard`
Response:
```json
{
  "message": "Welcome to Client Portal",
  "clientId": "uuid-...",
  "activeProjects": 2,
  "pendingInvoices": 1,
  "unreadTickets": 0
}
```

### List Requests
**GET** `/api/v1/portal/requests`

### Create Request
**POST** `/api/v1/portal/requests`
Request:
```json
{
  "subject": "Dashboard verileri gelmiyor",
  "description": "Sayfayi yenileyince istek atilmiyor gibi gorunuyor.",
  "priority": "MEDIUM",
  "type": "SUPPORT"
}
```

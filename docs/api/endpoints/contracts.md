# 📜 Contracts API

**Base URL:** `/api/v1/contracts`

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | List contracts | ADMIN, MANAGER |
| `POST` | `/` | Create/Upload a contract | ADMIN, MANAGER |
| `GET` | `/:id` | Get contract details | ADMIN, MANAGER |
| `PATCH` | `/:id/approve` | Approve contract | ADMIN, MANAGER |
| `PATCH` | `/:id/sign` | Sign contract (External Hook) | ADMIN, MANAGER |

## Usage Examples

### Create Contract
**POST** `/api/v1/contracts`
```json
{
  "title": "Service Agreement 2024",
  "clientId": "uuid...",
  "url": "https://s3.aws...",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

# ❤️ Health API

**Base URL:** `/api/v1/health`

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Check system status (DB & Redis) | Public |

## Usage Examples

### Check Health
**GET** `/api/v1/health`
Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00Z",
  "services": {
    "database": "up",
    "redis": "up"
  }
}
```

# 🏢 Clients API

**Base URL:** `/api/v1/clients`

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | List clients | ADMIN, MANAGER |
| `POST` | `/` | Create a new client | ADMIN, MANAGER |
| `GET` | `/:id` | Get client details | ADMIN, MANAGER |
| `PUT` | `/:id` | Update client details | ADMIN, MANAGER |

## Usage Examples

### Create Client
**POST** `/api/v1/clients`
```json
{
  "name": "Acme Corp",
  "email": "contact@acme.com",
  "phone": "+1234567890",
  "address": "123 Business Rd"
}
```

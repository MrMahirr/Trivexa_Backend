# 🎫 Tickets API

**Base URL:** `/api/v1/tickets`

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | List tickets (Support/Helpdesk) | Authenticated |
| `POST` | `/` | Create a ticket | Authenticated |
| `GET` | `/:id` | Get ticket details | Authenticated |
| `PATCH` | `/:id/status` | Update ticket status | Authenticated |
| `PATCH` | `/:id/assign` | Assign ticket to user | ADMIN, MANAGER |

## Usage Examples

### Create Ticket
**POST** `/api/v1/tickets`
```json
{
  "subject": "Login Issue",
  "description": "Cannot login with correct password",
  "priority": "HIGH"
}
```

### Update Status
**PATCH** `/api/v1/tickets/:id/status`
```json
{
  "status": "IN_PROGRESS"
}
```

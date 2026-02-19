# 🔔 Notifications API

**Base URL:** `/api/v1/notifications`

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Get user notifications | Authenticated |
| `GET` | `/unread-count` | Get unread count | Authenticated |
| `PATCH` | `/read-all` | Mark all as read | Authenticated |
| `PATCH` | `/:id/read` | Mark specific notification as read | Authenticated |

## Usage Examples

### Get Unread Count
**GET** `/api/v1/notifications/unread-count`
Response:
```json
{
  "count": 5
}
```

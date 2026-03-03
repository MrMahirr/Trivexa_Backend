# 📅 Meetings API

**Base URL:** `/api/v1/meetings`

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | List meetings | Authenticated |
| `POST` | `/` | Schedule a meeting | Authenticated |
| `GET` | `/:id` | Get meeting details | Authenticated |

## Usage Examples

### Schedule Meeting
**POST** `/api/v1/meetings`
```json
{
  "title": "Sprint Planning",
  "startTime": "2024-02-20T10:00:00Z",
  "endTime": "2024-02-20T11:00:00Z",
  "projectId": "uuid..."
}
```

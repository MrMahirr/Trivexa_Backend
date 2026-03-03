# ⏱️ Time Tracking API

**Base URL:** `/api/v1/time-entries`

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Manually log time | Authenticated |
| `GET` | `/` | List time entries | Authenticated |
| `POST` | `/start` | Start timer | Authenticated |
| `PATCH` | `/stop` | Stop active timer | Authenticated |
| `GET` | `/active` | Get currently running timer | Authenticated |
| `PATCH` | `/:id/approve` | Approve time entry | ADMIN, MANAGER |

## Usage Examples

### Start Timer
**POST** `/api/v1/time-entries/start`
```json
{
  "projectId": "uuid...",
  "taskId": "uuid...",
  "description": "Debugging API"
}
```

### Stop Timer
**PATCH** `/api/v1/time-entries/stop`

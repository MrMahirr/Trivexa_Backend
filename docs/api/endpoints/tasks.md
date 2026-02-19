# ⭐ Tasks API

**Base URL:** `/api/v1` (Mixed)

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/projects/:projectId/tasks` | List tasks for a project | Authenticated |
| `POST` | `/projects/:projectId/tasks` | Create a task in a project | Authenticated |
| `GET` | `/tasks/:id` | Get task details | Authenticated |
| `PUT` | `/tasks/:id` | Update task details | Authenticated |
| `PATCH` | `/tasks/:id/status` | Update task status (Board movement) | Authenticated |

## Usage Examples

### Create Task
**POST** `/api/v1/projects/:projectId/tasks`
```json
{
  "title": "Design Homepage",
  "description": "Create Figma mockups",
  "priority": "HIGH",
  "assigneeId": "uuid...",
  "dueDate": "2024-03-10"
}
```

### Move Task
**PATCH** `/api/v1/tasks/:id/status`
```json
{
  "status": "DONE"
}
```

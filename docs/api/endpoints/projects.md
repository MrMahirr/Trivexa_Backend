# 🚀 Projects API

**Base URL:** `/api/v1/projects`

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | List projects (scoped to user role) | Authenticated |
| `POST` | `/` | Create a new project | ADMIN, MANAGER |
| `GET` | `/:id` | Get project details | Authenticated |
| `PUT` | `/:id` | Update project details | ADMIN, MANAGER |
| `PATCH` | `/:id/status` | Update project status | ADMIN, MANAGER |
| `GET` | `/:id/members` | Get project members | Authenticated |
| `POST` | `/:id/members` | Add member to project | ADMIN, MANAGER |
| `DELETE` | `/:id/members/:userId` | Remove member from project | ADMIN, MANAGER |

## Usage Examples

### Create Project
**POST** `/api/v1/projects`
```json
{
  "name": "New Website Redesign",
  "description": "Full redesign of corporate website",
  "clientId": "uuid...",
  "startDate": "2024-03-01",
  "endDate": "2024-06-01",
  "budget": 50000
}
```

### Update Status
**PATCH** `/api/v1/projects/:id/status`
```json
{
  "status": "IN_PROGRESS"
}
```

# 🏢 Departments API

**Base URL:** `/api/v1/departments`

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | List all departments | Authenticated |
| `GET` | `/:id` | Get department details | Authenticated |

## Usage Examples

### List Departments
**GET** `/api/v1/departments`
Response:
```json
[
  {
    "id": "MANAGEMENT",
    "name": "Management",
    "description": "Executive and strategic management"
  },
  {
    "id": "DESIGN",
    "name": "Design",
    "description": "Creative design and UI/UX"
  }
]
```

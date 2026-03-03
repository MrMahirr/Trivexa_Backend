# 🛡️ Roles & Permissions API

**Base URL:** `/api/v1`

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/roles` | List all system roles | ADMIN, MANAGER |
| `GET` | `/roles/:id` | Get role details | ADMIN, MANAGER |
| `GET` | `/permissions` | List all permissions | ADMIN |

## Usage Examples

### List Roles
**GET** `/api/v1/roles`
Response:
```json
[
  {
    "id": "ADMIN",
    "name": "Admin",
    "description": "Full system access..."
  },
  {
    "id": "MEMBER",
    "name": "Member",
    "description": "Standard user access..."
  }
]
```

### List Permissions
**GET** `/api/v1/permissions`
Response:
```json
[
  {
    "id": "USERS_CREATE",
    "name": "USERS CREATE",
    "group": "USERS",
    "description": "Permission to create users"
  }
]
```

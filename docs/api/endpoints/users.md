# 👤 Users API

**Base URL:** `/api/v1/users`

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | List all users (with filters) | ADMIN, MANAGER |
| `POST` | `/` | Create a new user | ADMIN |
| `GET` | `/me` | Get current user's profile | Authenticated |
| `GET` | `/:id` | Get user details by ID | ADMIN, MANAGER |
| `PUT` | `/:id` | Update user details | ADMIN |
| `PATCH` | `/:id/deactivate` | Deactivate a user account | ADMIN |

## Usage Examples

### Create User
**POST** `/api/v1/users`
```json
{
  "email": "employee@trivexa.com",
  "password": "Password1!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "MEMBER",
  "department": "IT"
}
```

### Filter Users
**GET** `/api/v1/users?role=MEMBER&isActive=true`

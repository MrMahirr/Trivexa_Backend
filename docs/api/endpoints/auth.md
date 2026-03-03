# 🔐 Auth API

**Base URL:** `/api/v1/auth`

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/login` | Login with email & password | Public |
| `POST` | `/refresh` | Refresh access token using refresh token | Public |
| `POST` | `/logout` | Logout (invalidate refresh token) | Authenticated |
| `POST` | `/change-password` | Change current user's password | Authenticated |

## Usage Examples

### Login
**POST** `/api/v1/auth/login`
```json
{
  "email": "admin@trivexa.com",
  "password": "Password1!"
}
```

### Refresh Token
**POST** `/api/v1/auth/refresh`
```json
{
  "refreshToken": "eyJ..."
}
```

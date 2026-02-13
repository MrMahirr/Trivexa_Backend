# Authentication API Documentation

Trivexa Backend uses **JWT (JSON Web Token)** for authentication.
- **Access Token**: Short-lived (15 minutes). Used to access protected resources.
- **Refresh Token**: Long-lived (7 days). Used to obtain a new Access Token.

## Base URL
`POST /api/v1/auth`

---

## 1. Login (Staff/Admin)
Authenticates a user (Administrator, Manager, Employee) and returns tokens.

**Endpoint:** `POST /login`
**Access:** Public

### Request Body
```json
{
  "email": "admin@trivexa.com",
  "password": "securePassword123!"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "admin@trivexa.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "ADMIN",
      "department": "MANAGEMENT"
    }
  }
}
```

### Errors
- `401 Unauthorized`: Invalid email or password.
- `403 Forbidden`: Account deactivated.

---

## 2. Refresh Token
Obtains a new Access Token using a valid Refresh Token.

**Endpoint:** `POST /refresh`
**Access:** Public (Requires Refresh Token in body)

### Request Body
```json
{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "new_refresh_token_if_rotated..." 
  }
}
```

### Errors
- `401 Unauthorized`: Invalid or expired refresh token.

---

## 3. Logout
Invalidates the Refresh Token.

**Endpoint:** `POST /logout`
**Access:** Authenticated (Bearer Token)

### Headers
`Authorization: Bearer <accessToken>`

### Request Body
```json
{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 4. Force Change Password
Used when a user logs in with a temporary password (e.g., first login) and is required to change it.

**Endpoint:** `POST /change-password`
**Access:** Authenticated (Bearer Token - Temporary)

### Headers
`Authorization: Bearer <accessToken>`

### Request Body
```json
{
  "currentPassword": "tempPassword123",
  "newPassword": "newSecurePassword789!",
  "confirmPassword": "newSecurePassword789!"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 5. Client Portal Login (Magic Link Request)
Sends a login link to the client's email.

**Endpoint:** `POST /client/magic-link`
**Access:** Public

### Request Body
```json
{
  "email": "client@company.com"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "If the email exists, a magic link has been sent."
}
```

---

## 6. Client Portal Authentication (Verify Token)
Exchanges the token from the Magic Link for a session JWT.

**Endpoint:** `POST /client/login`
**Access:** Public

### Request Body
```json
{
  "token": "magic_link_token_from_email"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "clientUser": {
      "id": "987fcdeb-51a2-...",
      "email": "client@company.com",
      "clientId": "client_company_id"
    }
  }
}
```

# Security Design Strategy

Trivexa Backend adopts a "Security by Design" approach, implementing multiple layers of defense.

## 1. Authentication & Authorization

### 1.1 JWT Strategy
- **Access Token**: Short-lived (15 min), signed with a strong secret.
- **Refresh Token**: Long-lived (7 days), stored in the database (`auth_sessions`).
- **Rotation**: Refresh tokens are rotated on use. Old tokens are invalidated to prevent replay attacks.

### 1.2 Role-Based Access Control (RBAC)
- **Role Guard**: Checks `user.role` (ADMIN, MANAGER).
- **Permission Guard**: Checks granular capabilities (`user:create`).
- **Department Guard**: Ensures users only access resources within their or allowed departments.

## 2. Data Protection

### 2.1 Passwords
- **Hashing**: `bcrypt` with a salt round of **10** or higher.
- **Policy**: Minimum 8 chars, mixed case, numbers, special chars. Enforced by `class-validator`.

### 2.2 Sensitive Data
- **Personal Data (PII)**: Stored only when necessary.
- **API Keys/Secrets**: Never committed to code. Loaded via `ConfigService` from `.env`.

### 2.3 SQL Injection
- **Prevention**: Use of `pg` parameterized queries (`$1`, `$2`) is mandatory for all raw SQL operations.
- **ORM**: If TypeORM/Prisma were used, they would handle this. Since we use `pg`, explicit parameterization is enforced.

## 3. Network Security

### 3.1 Helmet.js
- Implements standard security headers (`X-Frame-Options`, `X-XSS-Protection`, `Content-Security-Policy`).

### 3.2 CORS (Cross-Origin Resource Sharing)
- Strictly whitelisted origins (e.g., `https://app.trivexa.com`, `https://portal.trivexa.com`).
- No wildcard (`*`) allowed in production.

### 3.3 Rate Limiting
- **Global**: 100 req/min per IP.
- **Auth**: 5 req/min per IP to prevent brute-force attacks.
- **Implementation**: `@nestjs/throttler` with `redis-store`.

## 4. Audit & Monitoring

### 4.1 Audit Logs
- Every critical write operation (CREATE, UPDATE, DELETE) is logged to `audit_logs` table.
- Logs include: `user_id`, `action`, `resource_id`, `ip_address`, `user_agent`, `old_value`, `new_value`.

### 4.2 Error Handling
- Detailed errors are logged internally (Console/File).
- Generic errors (`Internal Server Error`) are returned to the client to avoid leaking stack traces or schema details.

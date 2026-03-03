# Error Messages Glossary

A reference for specific error strings found in logs or API responses.

## 1. Database Errors (PostgreSQL)

| Error Code | Message Pattern | Meaning | Resolution |
|:---|:---|:---|:---|
| **23505** | `duplicate key value violates unique constraint` | Unique Violation | The record already exists (e.g., Email or Username). Check before inserting. |
| **23503** | `insert or update on table ... violates foreign key constraint` | FK Violation | The referenced ID (e.g., `client_id`) does not exist. |
| **23502** | `null value in column ... violates not-null constraint` | Not Null Violation | A required field is missing in the INSERT/UPDATE query. |
| **42P01** | `relation ... does not exist` | Missing Table | The table does not exist. Did you run migrations? |

## 2. Authentication Errors

| Code | Message | Resolution |
|:---|:---|:---|
| **AUTH_001** | `Invalid credentials` | User not found or password incorrect. |
| **AUTH_003** | `Token has expired` | The JWT access token is too old. Use Refresh Token to get a new one. |
| **AUTH_004** | `Invalid token signature` | The token was tampered with or signed with a different secret (e.g., after env change). |

## 3. Validation Errors (400 Bad Request)

| Field | Error | Meaning |
|:---|:---|:---|
| `email` | `email must be an email` | The provided string is not a valid email format. |
| `password` | `password is too weak` | Password must be 8+ chars, 1 uppercase, 1 symbol. |
| `startDate` | `startDate must be a ISO 8601 date string` | Send date as `YYYY-MM-DDTHH:mm:ssZ`. |

## 4. System Errors

| Message | Meaning | Resolution |
|:---|:---|:---|
| `Heap out of memory` | Node.js ran out of RAM. | Check for memory leaks or increase limit (`--max-old-space-size`). |
| `Connection timed out` | DB/Redis is unreachable. | Check network/firewall/VPN status. |

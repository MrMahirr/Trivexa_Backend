# Error Codes Documentation

This document lists all standard error codes returned by the Trivexa Backend API.
Errors are returned in the following JSON format:

```json
{
  "statusCode": 400,
  "timestamp": "2026-02-13T16:20:00.000Z",
  "path": "/api/v1/resource",
  "method": "POST",
  "errorCode": "VALIDATION_ERROR",
  "message": "Detailed error message",
  "details": { ...optional_metadata }
}
```

---

## 1. General Errors

| Code | HTTP Status | Description |
|:---|:---|:---|
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error. |
| `NOT_IMPLEMENTED` | 501 | Feature not yet implemented. |
| `SERVICE_UNAVAILABLE` | 503 | System is down for maintenance. |
| `TOO_MANY_REQUESTS` | 429 | Rate limit exceeded. |

## 2. Validation Errors

| Code | HTTP Status | Description |
|:---|:---|:---|
| `VALIDATION_ERROR` | 400 | Request body or parameters failed validation rules. |
| `INVALID_UUID` | 400 | The provided ID is not a valid UUID format. |
| `INVALID_DATE` | 400 | Date format is incorrect (ISO 8601 expected). |

## 3. Authentication Errors (AUTH)

| Code | HTTP Status | Description |
|:---|:---|:---|
| `AUTH_INVALID_CREDENTIALS` | 401 | Email or password incorrect. |
| `AUTH_TOKEN_MISSING` | 401 | Bearer token header is missing. |
| `AUTH_TOKEN_EXPIRED` | 401 | JWT access token has expired. |
| `AUTH_TOKEN_INVALID` | 401 | Malformed or tempered token. |
| `AUTH_REFRESH_TOKEN_INVALID` | 401 | Refresh token is invalid, expired, or revoked. |
| `AUTH_USER_DEACTIVATED` | 403 | User account has been disabled by admin. |
| `AUTH_PASSWORD_CHANGE_REQUIRED` | 403 | User must change temporary password before proceeding. |

## 4. Authorization Errors (ACCESS)

| Code | HTTP Status | Description |
|:---|:---|:---|
| `ACCESS_DENIED` | 403 | General permission denial. |
| `ACCESS_INSUFFICIENT_ROLE` | 403 | User role is not high enough for this action. |
| `ACCESS_WRONG_DEPARTMENT` | 403 | User does not belong to the required department. |
| `ACCESS_CLIENT_RESTRICTED` | 403 | Client users cannot access this resource. |

## 5. User Management Errors (USER)

| Code | HTTP Status | Description |
|:---|:---|:---|
| `USER_NOT_FOUND` | 404 | User with specified ID does not exist. |
| `USER_EMAIL_EXISTS` | 409 | A user with this email already exists. |
| `USER_OLD_PASSWORD_MISMATCH` | 400 | Current password provided does not match. |

## 6. Project & Task Errors (PROJ/TASK)

| Code | HTTP Status | Description |
|:---|:---|:---|
| `PROJECT_NOT_FOUND` | 404 | Project ID invalid or not found. |
| `TASK_NOT_FOUND` | 404 | Task ID invalid or not found. |
| `TASK_DEPENDENCY_BLOCK` | 409 | Cannot complete task; dependent tasks are incomplete. |
| `PROJECT_ARCHIVED` | 400 | Cannot modify an archived project. |

## 7. Financial Errors (FIN)

| Code | HTTP Status | Description |
|:---|:---|:---|
| `INVOICE_NOT_FOUND` | 404 | Invoice ID not found. |
| `INVOICE_ALREADY_PAID` | 409 | Cannot modify or pay a settled invoice. |
| `LEDGER_IMBALANCE` | 500 | Critical: Debit and Credit totals do not match. |
| `CURRENCY_MISMATCH` | 400 | Transaction currency differs from account currency. |

## 8. Client Portal Errors (CLIENT)

| Code | HTTP Status | Description |
|:---|:---|:---|
| `aaaCLIENT_NOT_FOUND` | 404 | Client ID invalid or not found. |
| `CLIENT_LINK_EXPIRED` | 401 | Magic link has expired. |
| `CLIENT_LINK_INVALID` | 401 | Magic link token is invalid or already used. |

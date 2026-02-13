# Rate Limiting & Throttling

To protect the API from abuse and ensure stability, Trivexa Backend implements **Rate Limiting** using **Redis**.

## 1. Limits

Limits are applied per **IP Address**.

| Route Type | Limit | Window | Description |
|:---|:---|:---|:---|
| **Public API** | 100 requests | 1 minute | General browsing, read-only public data. |
| **Auth Endpoints** | 5 requests | 1 minute | Login, Register, Password Reset (Brute-force protection). |
| **Sensitive Actions** | 10 requests | 1 minute | Payment processing, bulk deletion. |

> **Note:** Authenticated users may have higher limits depending on their plan/role in the future.

---

## 2. Response Headers

The API includes standard `RateLimit-*` headers in every response to help clients track their usage.

| Header | Description |
|:---|:---|
| `RateLimit-Limit` | The maximum number of requests allowed in the current window. |
| `RateLimit-Remaining` | The number of requests remaining in the current window. |
| `RateLimit-Reset` | The time (in seconds) until the window resets. |
| `Retry-After` | (Only on 429) Seconds to wait before making a new request. |

---

## 3. Exceeding the Limit

If a client exceeds the allowed number of requests, the API returns a `429 Too Many Requests` status code.

### Response Body
```json
{
  "statusCode": 429,
  "errorCode": "TOO_MANY_REQUESTS",
  "message": "ThrottlerException: Too Many Requests",
  "details": {
    "retryAfter": 45
  }
}
```

## 4. Implementation Details

We use `@nestjs/throttler` backed by **Redis** for distributed state management.
This ensures that rate limits are enforced consistently across multiple API instances/containers.

### Configuration
Defined in `src/config/rate-limit.config.ts`.

```typescript
// Example usage in Controller
@UseGuards(ThrottlerGuard)
@Throttle(5, 60) // Override: 5 requests per 60 seconds
@Post('login')
login() { ... }
```

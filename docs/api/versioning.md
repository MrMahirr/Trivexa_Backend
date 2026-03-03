# API Versioning Strategy

Trivexa Backend uses **URI Versioning**.
The version number is included as part of the URL path found in the global prefix.

## 1. Current Version

**Current Stable Version:** `v1`

**Base URL Pattern:**
`https://api.trivexa.com/api/v1/...`

## 2. Implementation

All endpoints are prefixed globally in `main.ts` using NestJS `setGlobalPrefix`.

```typescript
// main.ts
app.setGlobalPrefix('api/v1');
```

So a request to the Users controller becomes:
`GET /api/v1/users`

## 3. Deprecation Policy

When a breaking change is introduced, a new version (e.g., `v2`) will be deployed alongside the existing version.

- **Non-breaking changes** (adding fields, new endpoints) will be added to the **current** version (`v1`).
- **Breaking changes** (renaming fields, changing types) will strictly require a **new** version (`v2`).
- Deprecated versions will be supported for a minimum of **6 months** after a new version is released.
- Clients using deprecated versions will receive a `Warning` header in the response.

## 4. Header Versioning (Reserved)

While we strictly use URI versioning for major releases, we reserve the right to use the `X-API-Version` header for minor, non-breaking feature toggles if necessary in the future. Currently, this is **not** properly implemented or required.

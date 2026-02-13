# Performance Optimization Guide

Tips and rules to keep Trivexa Backend fast and scalable.

## 1. Database Optimization (PostgreSQL)

The database is the most common bottleneck.

### 1.1 Indexing
- **Foreign Keys**: Always index FK columns (e.g., `user_id`, `project_id`). PostgreSql does *not* do this automatically.
- **Search Filters**: Add indices on columns frequently used in `WHERE` clauses (e.g., `status`, `email`).
- **Composite Indices**: For queries filtering by multiple columns (e.g., `project_id` AND `status`).

### 1.2 Query Efficiency
- **SELECT specific columns**: Avoid `SELECT *`. Fetch only what you need.
- **Pagination**: Always use `LIMIT` and `OFFSET` (or cursor-based pagination) for lists.
- **N+1 Problem**: Use `JOIN`s or `IN (...)` queries instead of executing a query inside a loop.

## 2. Caching Strategy (Redis)

Cache expensive operations to reduce DB load.

- **TTL (Time To Live)**: Always set an expiration.
    - User Profiles: 1 hour
    - Dashboard Stats: 5 minutes
    - Static Data (Enums): 24 hours
- **Invalidation**: Clear the cache when data changes (e.g., `UPDATE project SET ...` -> `redis.del('project:123')`).

## 3. Application Code (Node.js)

- **Async/Await**: properly await Promises. Do not block the Event Loop with synchronous heavy computation (CPU-bound tasks).
- **Compression**: Gzip/Brotli is enabled globally via `compression` middleware.
- **Validation**: Use `ValidationPipe` with `{ transform: true, whitelist: true }` to strip unwanted fields early.

## 4. Monitoring
- Use the `/metrics` endpoint to spot slow API routes (`http_request_duration_seconds`).
- Watch for `Slow Query` logs in the database console (> 100ms).

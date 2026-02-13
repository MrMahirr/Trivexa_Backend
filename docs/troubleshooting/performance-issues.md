# Troubleshooting Performance Issues

Diagnose and fix common performance bottlenecks.

## 1. Slow API Response (> 500ms)

### 1.1 Database Bottleneck
- **Symptoms**: High `waiting` time in APM, Slow Query logs.
- **Diagnosis**:
    - Run `EXPLAIN ANALYZE SELECT ...` on the suspicious query.
    - Check if the query is doing a `SEQ SCAN` (Sequential Scan) on a large table.
- **Solution**: Add an Index.
    ```sql
    CREATE INDEX idx_projects_status ON projects(status);
    ```

### 1.2 N+1 Query Problem
- **Symptoms**: Hundreds of small queries for a single API call.
- **Diagnosis**: Enable `DB_LOGGING=true` and check console.
- **Solution**: Use `JOIN` or fetch related entities in a single query (e.g., `WHERE id IN (...)`).

## 2. High Memory Usage

### 2.1 Memory Leak
- **Symptoms**: RAM usage grows continuously until Crash (OOM).
- **Diagnosis**:
    - Inspect active handles/listeners.
    - Check for global arrays/maps that never get cleared.
- **Solution**: Use `node --inspect` and Chrome DevTools Memory Profiler.

## 3. Connection Timeouts

### 3.1 Pool Exhaustion
- **Symptoms**: `timeout exceeded when trying to connect`.
- **Diagnosis**: Check active connections in Postgres.
    ```sql
    SELECT count(*) FROM pg_stat_activity;
    ```
- **Solution**: Increase `max` pool size in `database.config.ts`, or fix leaking clients (always `client.release()`!).

## 4. High CPU Usage

- **Cause**: Blocking the Event Loop with heavy sync operations (e.g., Image processing, Encryption).
- **Solution**: Offload heavy tasks to a **Worker Thread** or **Background Queue** (BullMQ).

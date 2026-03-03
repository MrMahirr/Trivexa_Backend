# Audit Logging Strategy

Trivexa maintains a comprehensive audit trail to track "Who did what, and when".

## 1. Entity Auditing (Data Changes)

We track changes to critical entities (Users, Projects, Contracts) in the `audit_logs` table.

### Schema
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    table_name TEXT,       -- e.g., 'users'
    record_id UUID,        -- Primary Key of the changed row
    action TEXT,           -- 'INSERT', 'UPDATE', 'DELETE'
    old_data JSONB,        -- Snapshot before change
    new_data JSONB,        -- Snapshot after change
    trivexa_user_id UUID,  -- Who performed the action
    created_at TIMESTAMP
);
```

### Implementation
- **method**: Application-Level Interceptors (or Subscriber patterns).
- **Trigger**: We prefer application logic over DB triggers to capture the `trivexa_user_id` from the JWT context.

## 2. System Logging (Operational)

Operational events (Login success/fail, Third-party API errors) are logged to:
1.  **Stdout (Console)**: For immediate observability (captured by Docker/Kubernetes).
2.  **`system_logs` Table**: For critical alerts that need to be queried via Admin Panel.

### Levels
- `INFO`: "User X logged in."
- `WARN`: "Rate limit exceeded for IP Y."
- `ERROR`: "Payment Gateway timeout."

## 3. Retention Policy

Audit logs can grow very fast.

- **Hot Storage (DB)**: 90 Days.
- **Cold Storage (S3)**: Archived after 90 days (CSV format).
- **Deletion**: Logs older than 1 year are permanently deleted (unless legal hold applies).

## 4. Access Control

- **Read Access**: Only `ADMIN` role can view Audit Logs via the Settings panel.
- **Write Access**: Application System only (Immutable). No user can manually modify/delete logs.

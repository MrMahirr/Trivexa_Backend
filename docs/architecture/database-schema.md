# Database Schema Documentation

Trivexa uses **PostgreSQL 16**.
The database design follows **3rd Normal Form (3NF)**.
All tables are in the `public` schema.

## 1. Naming Conventions

- **Tables**: `snake_case` (plural) e.g., `users`, `projects`.
- **Columns**: `snake_case` e.g., `first_name`, `created_at`.
- **Primary Keys**: `id` (UUID v7 or v4).
- **Foreign Keys**: `singular_table_name_id` e.g., `user_id`, `project_id`.
- **Indexes**: `idx_table_column`.

## 2. Common Fields

Every table includes audit timestamps:

```sql
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
deleted_at TIMESTAMPTZ -- Soft delete support
```

---

## 3. Core Tables

### `users`
System users (Admins, Staff).

| Column | Type | Constraints | Description |
|:---|:---|:---|:---|
| `id` | UUID | PK | Unique User ID |
| `email` | VARCHAR(255) | UQ, NOT NULL | Login Email |
| `password_hash` | VARCHAR | NOT NULL | Bcrypt hash |
| `role` | VARCHAR(50) | NOT NULL | ADMIN, MANAGER, etc. |
| `department` | VARCHAR(50) | NULL | IT, HR, etc. |

### `clients`
Customer companies.

| Column | Type | Constraints | Description |
|:---|:---|:---|:---|
| `id` | UUID | PK | Client ID |
| `company_name` | VARCHAR | NOT NULL | |
| `tax_number` | VARCHAR | | For invoicing |
| `status` | VARCHAR | | ACTIVE, INACTIVE |

### `projects`
Projects managed by the agency.

| Column | Type | Constraints | Description |
|:---|:---|:---|:---|
| `id` | UUID | PK | |
| `client_id` | UUID | FK -> clients | |
| `name` | VARCHAR | NOT NULL | |
| `status` | VARCHAR | | PLANNED, ACTIVE, COMPLETED |
| `start_date` | DATE | | |
| `budget` | DECIMAL(15,2) | | |

---

## 4. Financial Tables

### `invoices`
Sales invoices issued to clients.

| Column | Type | Constraints | Description |
|:---|:---|:---|:---|
| `id` | UUID | PK | |
| `client_id` | UUID | FK -> clients | |
| `number` | VARCHAR | UQ | INV-2024-001 |
| `total_amount` | DECIMAL(15,2) | NOT NULL | |
| `status` | VARCHAR | | DRAFT, SENT, PAID |
| `issue_date` | DATE | | |
| `due_date` | DATE | | |

### `ledger_entries`
Double-entry bookkeeping records.

| Column | Type | Constraints | Description |
|:---|:---|:---|:---|
| `id` | UUID | PK | |
| `transaction_date` | DATE | NOT NULL | |
| `debit_account_id` | UUID | FK -> accounts | |
| `credit_account_id` | UUID | FK -> accounts | |
| `amount` | DECIMAL(15,2) | NOT NULL | |
| `description` | TEXT | | |

---

## 5. Indexes & Performance

- **Composite Indexes**: Used on `tasks` for filtering by `(project_id, status)`.
- **Partial Indexes**: Used on `users` for `email` where `deleted_at IS NULL`.
- **Triggers**:
    - `update_timestamp()`: Automatically updates `updated_at`.
    - `enforce_ledger_balance()`: Ensures debit = credit in transactions.

# Database Migrations

Trivexa Backend uses a **Pure SQL** approach for database schema management.
We do NOT use ORM-based migrations (like Prisma Migrate or TypeORM Sync) to maintain full control over database performance and specific PostgreSQL features.

## 1. Local Development

In local development (Docker), the database is initialized automatically using the scripts found in:
`./docker/postgres/init/`

### 1.1 Initialization Order
PostgreSQL runs scripts in alphanumeric order. We follow this convention:
- `001_...`: Extensions
- `010_...`: Helper Functions
- `020_...` to `090_...`: Feature Tables (Users, Projects, etc.)
- `900_...`: Seed Data

### 1.2 Applying Changes Locally
Since we are in early development:
1.  Modify the relevant SQL file in `./docker/postgres/init`.
2.  Reset the database:
    ```bash
    docker-compose down -v
    docker-compose up -d
    ```

## 2. Production Migrations

Once the application is live, we cannot reset the database.
We will adopt a **Forward-Only Migration Strategy**.

### 2.1 Migration Script Format
Create a new SQL file in a `migrations/` folder (to be created):
`YYYYMMDDHHMM_description.sql`

*Example:* `202402141200_add_user_phone.sql`
```sql
ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);
CREATE INDEX idx_users_phone ON users(phone_number);
```

### 2.2 Applying Migrations
We will create a simple utility script (`npm run migration:run`) that:
1.  Checks a `migrations_log` table in the DB.
2.  Executes any SQL files in `migrations/` that haven't been run yet.
3.  Records the execution in `migrations_log`.

## 3. Rules
- **Never** modify an existing migration file after it has been merged/deployed.
- **Always** test rollback scripts (down migrations) locally.
- **Transactions**: Wrap DDL statements in `BEGIN; ... COMMIT;` where possible to ensure atomicity.

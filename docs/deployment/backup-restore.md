# Backup & Restore Strategy

Ensuring data durability is critical. Trivexa uses a combination of automated database dumps and cloud storage versioning.

## 1. Database Backups (PostgreSQL)

We use `pg_dump` to create logical backups of the database.

### 1.1 Automated Daily Backups
- **Schedule**: Daily at 03:00 AM UTC.
- **Retention**:
    - Daily: 30 Days
    - Monthly: 12 Months
- **Storage**: Encrypted AWS S3 Bucket (Infrequent Access tier).

### 1.2 Manual Backup Command
To trigger a backup manually (e.g., before a major deployment):

```bash
# Docker Environment
docker exec -t trivexa_postgres pg_dumpall -c -U admin > dump_$(date +%Y-%m-%d).sql
```

## 2. File Storage Backups

User uploads (Avatars, Attachments, Contracts) are stored in **AWS S3**.

- **Versioning**: Enabled on the S3 bucket to recover deleted or overwritten files.
- **Replication**: Cross-Region Replication (CRR) to a secondary region for disaster recovery.

## 3. Restore Procedure

### 3.1 Restoring Database
**Warning**: This will overwrite the current database state.

1.  Stop the application to prevent new writes.
2.  Drop the existing database (optional but recommended for clean restore).
3.  Run the restore command:

```bash
# Docker Environment
cat dump_2024-01-01.sql | docker exec -i trivexa_postgres psql -U admin -d trivexa_db
```

4.  Restart the application.

### 3.2 Point-in-Time Recovery (PITR)
For critical production incidents, we rely on AWS RDS automated backups which allow restoring to any specific second within the retention window (usually 7-35 days).

## 4. Disaster Recovery Goals

- **RPO (Recovery Point Objective)**: Max 1 hour data loss (in case of total failure).
- **RTO (Recovery Time Objective)**: Max 4 hours to bring systems back online.

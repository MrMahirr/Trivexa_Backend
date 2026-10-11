#!/bin/bash
#
# Database Restore Script for Trivexa
#
# This script restores a PostgreSQL database backup
#
# Usage: ./restore-database.sh <backup-file>
#

set -euo pipefail

# Check arguments
if [ $# -lt 1 ]; then
    echo "Usage: $0 <backup-file>"
    echo "Example: $0 /opt/trivexa/backups/database/trivexa_production_20261011_150000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

# Verify backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Load environment variables
if [ -f ../.env.production ]; then
    export $(cat ../.env.production | grep -v '^#' | xargs)
fi

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-trivexa_production}"
DB_USER="${DB_USER:-trivexa_prod_user}"

echo "=========================================="
echo "Database Restore"
echo "=========================================="
echo "Backup file: $BACKUP_FILE"
echo "Database: $DB_NAME"
echo "Host: $DB_HOST"
echo "=========================================="
echo ""

# Confirm restore
read -p "This will OVERWRITE the current database. Are you sure? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Restore cancelled"
    exit 0
fi

# Final confirmation
read -p "Type 'RESTORE' to confirm: " confirm2
if [ "$confirm2" != "RESTORE" ]; then
    echo "Restore cancelled"
    exit 0
fi

echo ""
echo "Starting restore..."

# Drop existing connections
echo "Dropping existing connections..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres << EOF
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = '$DB_NAME'
  AND pid <> pg_backend_pid();
EOF

# Restore database
echo "Restoring database from $BACKUP_FILE..."
gunzip -c "$BACKUP_FILE" | PGPASSWORD="$DB_PASSWORD" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --single-transaction

echo ""
echo "=========================================="
echo "Restore completed successfully!"
echo "=========================================="

exit 0

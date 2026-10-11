#!/bin/bash
#
# Database Backup Script for Trivexa
#
# This script creates PostgreSQL database backups with:
# - Compression (gzip)
# - Retention policy (30 days)
# - Email notifications on failure
# - Optional S3 upload
#
# Usage: ./backup-database.sh [--s3] [--retention-days 30]
#

set -euo pipefail

# ============================================
# Configuration
# ============================================

# Load environment variables
if [ -f ../.env.production ]; then
    export $(cat ../.env.production | grep -v '^#' | xargs)
fi

# Database configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-trivexa_production}"
DB_USER="${DB_USER:-trivexa_prod_user}"

# Backup configuration
BACKUP_DIR="/opt/trivexa/backups/database"
RETENTION_DAYS=30
S3_UPLOAD=false
S3_BUCKET="${AWS_S3_BACKUP_BUCKET:-}"
NOTIFICATION_EMAIL="${ADMIN_NOTIFICATION_EMAIL:-}"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --s3)
            S3_UPLOAD=true
            shift
            ;;
        --retention-days)
            RETENTION_DAYS="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# ============================================
# Functions
# ============================================

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

error() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1" >&2
}

send_notification() {
    local subject="$1"
    local body="$2"

    if [ -n "$NOTIFICATION_EMAIL" ]; then
        echo "$body" | mail -s "$subject" "$NOTIFICATION_EMAIL" 2>/dev/null || true
    fi
}

# ============================================
# Main Backup Process
# ============================================

log "Starting database backup for $DB_NAME"

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
TIMESTAMP=$(date +'%Y%m%d_%H%M%S')
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql.gz"

# Perform backup
log "Creating backup: $BACKUP_FILE"

if PGPASSWORD="$DB_PASSWORD" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --format=plain \
    --no-owner \
    --no-acl \
    --verbose \
    2>&1 | gzip > "$BACKUP_FILE"; then

    log "Backup created successfully"

    # Get backup size
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log "Backup size: $BACKUP_SIZE"

else
    error "Backup failed"
    send_notification \
        "Trivexa Database Backup Failed" \
        "Database backup for $DB_NAME failed at $(date). Please check the logs."
    exit 1
fi

# ============================================
# Upload to S3 (Optional)
# ============================================

if [ "$S3_UPLOAD" = true ] && [ -n "$S3_BUCKET" ]; then
    log "Uploading backup to S3: $S3_BUCKET"

    if aws s3 cp "$BACKUP_FILE" "s3://$S3_BUCKET/database-backups/" \
        --storage-class STANDARD_IA \
        --server-side-encryption AES256; then

        log "Backup uploaded to S3 successfully"
    else
        error "S3 upload failed"
        send_notification \
            "Trivexa S3 Upload Failed" \
            "Failed to upload backup to S3 at $(date). Local backup is available at $BACKUP_FILE"
    fi
fi

# ============================================
# Cleanup Old Backups
# ============================================

log "Cleaning up backups older than $RETENTION_DAYS days"

find "$BACKUP_DIR" \
    -name "${DB_NAME}_*.sql.gz" \
    -type f \
    -mtime +$RETENTION_DAYS \
    -delete

# Count remaining backups
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -type f | wc -l)
log "Total backups: $BACKUP_COUNT"

# ============================================
# Verify Backup Integrity
# ============================================

log "Verifying backup integrity"

if gzip -t "$BACKUP_FILE"; then
    log "Backup integrity verified successfully"
else
    error "Backup file is corrupted"
    send_notification \
        "Trivexa Backup Corrupted" \
        "Backup file at $BACKUP_FILE is corrupted. Please investigate."
    exit 1
fi

# ============================================
# Summary
# ============================================

log "=========================================="
log "Backup completed successfully"
log "File: $BACKUP_FILE"
log "Size: $BACKUP_SIZE"
log "Retention: $RETENTION_DAYS days"
log "Total backups: $BACKUP_COUNT"
log "=========================================="

exit 0

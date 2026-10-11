#!/bin/bash

# =====================================================
# Trivexa Deployment Rollback Script
# =====================================================
# Purpose: Rollback to previous deployment state
# Usage: ./scripts/rollback.sh [--backup=backup-2026-10-11.tar.gz] [--commit=abc123]
#
# Features:
# - Database restore from backup
# - Git revert to previous commit
# - PM2 service restart
# - Health check verification
# - Automated notifications
# =====================================================

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="/opt/trivexa/backups"
LOG_DIR="/var/log/trivexa"
LOG_FILE="$LOG_DIR/rollback_$(date +%Y%m%d_%H%M%S).log"
POSTGRES_DB="${POSTGRES_DB:-trivexa}"
POSTGRES_USER="${POSTGRES_USER:-trivexa_user}"

# Create log directory
mkdir -p "$LOG_DIR"

# Logging function
log() {
    echo -e "${1}" | tee -a "$LOG_FILE"
}

# =====================================================
# Parse Arguments
# =====================================================
BACKUP_FILE=""
TARGET_COMMIT=""

for arg in "$@"; do
    case $arg in
        --backup=*)
            BACKUP_FILE="${arg#*=}"
            shift
            ;;
        --commit=*)
            TARGET_COMMIT="${arg#*=}"
            shift
            ;;
        --help)
            echo "Trivexa Rollback Script"
            echo ""
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --backup=FILE    Backup file to restore (e.g., backup-2026-10-11.tar.gz)"
            echo "  --commit=HASH    Git commit to rollback to"
            echo "  --help           Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 --backup=backup-2026-10-11.tar.gz"
            echo "  $0 --commit=abc123def"
            echo "  $0 --backup=backup-2026-10-11.tar.gz --commit=abc123def"
            exit 0
            ;;
        *)
            echo "Unknown option: $arg"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# =====================================================
# Validation
# =====================================================
log "${BLUE}============================================${NC}"
log "${BLUE}TRIVEXA DEPLOYMENT ROLLBACK${NC}"
log "${BLUE}Started: $(date)${NC}"
log "${BLUE}============================================${NC}"
log ""

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ] && ! sudo -n true 2>/dev/null; then
    log "${RED}ERROR: This script requires sudo privileges${NC}"
    exit 1
fi

# Validate backup file if provided
if [ -n "$BACKUP_FILE" ]; then
    if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
        log "${RED}ERROR: Backup file not found: $BACKUP_DIR/$BACKUP_FILE${NC}"
        log "${YELLOW}Available backups:${NC}"
        ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null || echo "No backups found"
        exit 1
    fi
fi

# Validate commit if provided
if [ -n "$TARGET_COMMIT" ]; then
    if ! git cat-file -e "$TARGET_COMMIT" 2>/dev/null; then
        log "${RED}ERROR: Invalid commit hash: $TARGET_COMMIT${NC}"
        exit 1
    fi
fi

# If no options provided, show recent backups and commits
if [ -z "$BACKUP_FILE" ] && [ -z "$TARGET_COMMIT" ]; then
    log "${YELLOW}No rollback target specified!${NC}"
    log ""
    log "${BLUE}Recent backups:${NC}"
    ls -lt "$BACKUP_DIR"/*.tar.gz 2>/dev/null | head -5 || echo "No backups found"
    log ""
    log "${BLUE}Recent commits:${NC}"
    git log --oneline -5
    log ""
    log "${YELLOW}Please specify --backup and/or --commit${NC}"
    log "Example: $0 --backup=backup-2026-10-11.tar.gz --commit=abc123"
    exit 1
fi

# =====================================================
# Confirmation
# =====================================================
log "${YELLOW}WARNING: This will rollback the deployment!${NC}"
log ""
if [ -n "$BACKUP_FILE" ]; then
    log "Database backup: ${BLUE}$BACKUP_FILE${NC}"
fi
if [ -n "$TARGET_COMMIT" ]; then
    log "Git commit: ${BLUE}$TARGET_COMMIT${NC}"
    git show --stat "$TARGET_COMMIT" | head -10
fi
log ""
read -p "Continue with rollback? (yes/no): " CONFIRMATION

if [ "$CONFIRMATION" != "yes" ]; then
    log "${YELLOW}Rollback cancelled by user${NC}"
    exit 0
fi

# =====================================================
# Step 1: Stop Application
# =====================================================
log ""
log "${BLUE}Step 1: Stopping application...${NC}"

if command -v pm2 &> /dev/null; then
    pm2 stop trivexa-backend || true
    log "${GREEN}✓ PM2 application stopped${NC}"
else
    log "${YELLOW}⚠ PM2 not found, skipping application stop${NC}"
fi

# =====================================================
# Step 2: Database Rollback
# =====================================================
if [ -n "$BACKUP_FILE" ]; then
    log ""
    log "${BLUE}Step 2: Restoring database from backup...${NC}"

    # Extract backup
    TEMP_DIR=$(mktemp -d)
    tar -xzf "$BACKUP_DIR/$BACKUP_FILE" -C "$TEMP_DIR"

    # Find SQL file
    SQL_FILE=$(find "$TEMP_DIR" -name "*.sql" | head -1)

    if [ -z "$SQL_FILE" ]; then
        log "${RED}ERROR: No SQL file found in backup${NC}"
        rm -rf "$TEMP_DIR"
        exit 1
    fi

    # Drop existing connections
    psql -U "$POSTGRES_USER" -d postgres -c "
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = '$POSTGRES_DB'
          AND pid <> pg_backend_pid();
    " || true

    # Restore database
    dropdb -U "$POSTGRES_USER" "$POSTGRES_DB" --if-exists
    createdb -U "$POSTGRES_USER" "$POSTGRES_DB"
    psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < "$SQL_FILE"

    # Cleanup
    rm -rf "$TEMP_DIR"

    log "${GREEN}✓ Database restored successfully${NC}"
fi

# =====================================================
# Step 3: Git Rollback
# =====================================================
if [ -n "$TARGET_COMMIT" ]; then
    log ""
    log "${BLUE}Step 3: Rolling back code to commit ${TARGET_COMMIT}...${NC}"

    # Stash any uncommitted changes
    git stash push -m "Rollback stash $(date +%Y%m%d_%H%M%S)" || true

    # Reset to target commit
    git reset --hard "$TARGET_COMMIT"

    # Reinstall dependencies
    if [ -f "package.json" ]; then
        log "${YELLOW}Installing dependencies...${NC}"
        npm ci --production
    fi

    # Rebuild if needed
    if [ -f "package.json" ] && grep -q "\"build\"" package.json; then
        log "${YELLOW}Building application...${NC}"
        npm run build
    fi

    log "${GREEN}✓ Code rolled back successfully${NC}"
fi

# =====================================================
# Step 4: Restart Application
# =====================================================
log ""
log "${BLUE}Step 4: Restarting application...${NC}"

if command -v pm2 &> /dev/null; then
    pm2 start trivexa-backend || pm2 restart trivexa-backend
    pm2 save
    log "${GREEN}✓ Application restarted${NC}"
else
    log "${YELLOW}⚠ PM2 not found, please start application manually${NC}"
fi

# Wait for app to start
log "${YELLOW}Waiting 10 seconds for application to start...${NC}"
sleep 10

# =====================================================
# Step 5: Health Check
# =====================================================
log ""
log "${BLUE}Step 5: Running health checks...${NC}"

API_URL="${API_URL:-http://localhost:3500/api/v1/health}"
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL" || echo "000")

if [ "$HEALTH_CHECK" = "200" ]; then
    log "${GREEN}✓ Health check passed (200 OK)${NC}"
else
    log "${RED}✗ Health check failed (HTTP $HEALTH_CHECK)${NC}"
    log "${YELLOW}Please check application logs:${NC}"
    log "  pm2 logs trivexa-backend"
    log "  tail -f $LOG_DIR/error.log"
fi

# =====================================================
# Step 6: Smoke Tests
# =====================================================
log ""
log "${BLUE}Step 6: Running smoke tests...${NC}"

# Test database connection
if psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT 1;" > /dev/null 2>&1; then
    log "${GREEN}✓ Database connection OK${NC}"
else
    log "${RED}✗ Database connection FAILED${NC}"
fi

# Test Redis connection
if redis-cli ping > /dev/null 2>&1; then
    log "${GREEN}✓ Redis connection OK${NC}"
else
    log "${YELLOW}⚠ Redis connection FAILED${NC}"
fi

# =====================================================
# Summary
# =====================================================
log ""
log "${BLUE}============================================${NC}"
log "${BLUE}ROLLBACK COMPLETE${NC}"
log "${BLUE}Completed: $(date)${NC}"
log "${BLUE}============================================${NC}"
log ""
log "Log file: ${BLUE}$LOG_FILE${NC}"
log ""

if [ "$HEALTH_CHECK" = "200" ]; then
    log "${GREEN}✓ Rollback successful!${NC}"
    log ""
    log "Next steps:"
    log "  1. Verify critical functionality manually"
    log "  2. Check application logs: pm2 logs"
    log "  3. Monitor error rates in Sentry"
    log "  4. Notify team of rollback"
else
    log "${RED}✗ Rollback completed but health check failed${NC}"
    log ""
    log "Troubleshooting:"
    log "  1. Check logs: pm2 logs trivexa-backend"
    log "  2. Check database: psql -U $POSTGRES_USER -d $POSTGRES_DB"
    log "  3. Check environment variables: cat .env.production"
    log "  4. Manual restart: pm2 restart trivexa-backend"
fi

log ""

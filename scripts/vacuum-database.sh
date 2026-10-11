#!/bin/bash

# PostgreSQL Vacuum & Analyze Script
# Run weekly via cron for database maintenance

set -e

# Configuration
DB_NAME="${POSTGRES_DB:-trivexa}"
DB_USER="${POSTGRES_USER:-trivexa_user}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_DIR="/var/log/trivexa"
LOG_FILE="$LOG_DIR/vacuum_$TIMESTAMP.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create log directory
mkdir -p "$LOG_DIR"

# Logging function
log() {
    echo -e "${1}" | tee -a "$LOG_FILE"
}

log "========================================"
log "Database Vacuum Started: $(date)"
log "========================================"
log "Database: $DB_NAME"
log "Host: $DB_HOST:$DB_PORT"
log "User: $DB_USER"
log ""

# Function: Check database connection
check_connection() {
    log "${YELLOW}Checking database connection...${NC}"

    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
        log "${GREEN}✅ Database connection successful${NC}"
        return 0
    else
        log "${RED}❌ Cannot connect to database${NC}"
        exit 1
    fi
}

# Function: Check dead tuples
check_dead_tuples() {
    log ""
    log "${YELLOW}Checking dead tuples...${NC}"

    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<EOF | tee -a "$LOG_FILE"
SELECT
    schemaname,
    relname AS table_name,
    n_live_tup AS live_tuples,
    n_dead_tup AS dead_tuples,
    ROUND(n_dead_tup * 100.0 / NULLIF(n_live_tup + n_dead_tup, 0), 2) AS dead_percentage,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||relname)) AS size,
    last_vacuum,
    last_autovacuum
FROM pg_stat_user_tables
WHERE n_dead_tup > 0
ORDER BY n_dead_tup DESC
LIMIT 10;
EOF
}

# Function: Check table bloat
check_bloat() {
    log ""
    log "${YELLOW}Checking table sizes and bloat...${NC}"

    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<EOF | tee -a "$LOG_FILE"
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS index_size,
    n_live_tup,
    n_dead_tup
FROM pg_tables
LEFT JOIN pg_stat_user_tables ON pg_tables.tablename = pg_stat_user_tables.relname
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
EOF
}

# Function: Vacuum analyze all tables
vacuum_analyze() {
    log ""
    log "${YELLOW}Running VACUUM ANALYZE...${NC}"

    START_TIME=$(date +%s)

    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "VACUUM ANALYZE VERBOSE;" 2>&1 | tee -a "$LOG_FILE"; then
        END_TIME=$(date +%s)
        DURATION=$((END_TIME - START_TIME))
        log "${GREEN}✅ VACUUM ANALYZE completed successfully in ${DURATION}s${NC}"
    else
        log "${RED}❌ VACUUM ANALYZE failed${NC}"
        exit 1
    fi
}

# Function: Update statistics
update_statistics() {
    log ""
    log "${YELLOW}Updating table statistics...${NC}"

    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "ANALYZE VERBOSE;" 2>&1 | tee -a "$LOG_FILE"; then
        log "${GREEN}✅ Statistics updated successfully${NC}"
    else
        log "${RED}❌ Statistics update failed${NC}"
        exit 1
    fi
}

# Function: Check vacuum activity
check_vacuum_activity() {
    log ""
    log "${YELLOW}Checking vacuum activity...${NC}"

    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<EOF | tee -a "$LOG_FILE"
SELECT
    schemaname,
    relname AS table_name,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze,
    vacuum_count,
    autovacuum_count,
    analyze_count,
    autoanalyze_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY GREATEST(last_vacuum, last_autovacuum) DESC NULLS LAST
LIMIT 10;
EOF
}

# Function: Check for tables needing vacuum
check_needs_vacuum() {
    log ""
    log "${YELLOW}Tables with > 10% dead tuples...${NC}"

    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<EOF | tee -a "$LOG_FILE"
SELECT
    schemaname,
    relname AS table_name,
    n_live_tup,
    n_dead_tup,
    ROUND(n_dead_tup * 100.0 / NULLIF(n_live_tup + n_dead_tup, 0), 2) AS dead_pct,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||relname)) AS size
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND n_dead_tup > 100
  AND n_dead_tup * 100.0 / NULLIF(n_live_tup + n_dead_tup, 0) > 10
ORDER BY dead_pct DESC;
EOF
}

# Main execution
main() {
    check_connection

    log ""
    log "========================================="
    log "BEFORE VACUUM - Database Statistics"
    log "========================================="
    check_needs_vacuum
    check_dead_tuples
    check_bloat

    log ""
    log "========================================="
    log "RUNNING VACUUM"
    log "========================================="
    vacuum_analyze
    update_statistics

    log ""
    log "========================================="
    log "AFTER VACUUM - Database Statistics"
    log "========================================="
    check_dead_tuples
    check_vacuum_activity

    log ""
    log "========================================="
    log "Database Vacuum Completed: $(date)"
    log "Log saved to: $LOG_FILE"
    log "========================================="

    # Cleanup old logs (keep 30 days)
    find "$LOG_DIR" -name "vacuum_*.log" -mtime +30 -delete

    log "${GREEN}✅ All maintenance tasks completed successfully${NC}"
}

# Run main function
main

exit 0

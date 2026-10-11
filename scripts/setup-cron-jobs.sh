#!/bin/bash

# =====================================================
# Trivexa Cron Jobs Setup Script
# =====================================================
# Purpose: Configure automated cron jobs for maintenance
# Usage: sudo ./scripts/setup-cron-jobs.sh
#
# Cron Jobs Configured:
# - Database backup (Daily 03:00)
# - Database vacuum (Weekly Sunday 02:00)
# - Log rotation (Automatic via logrotate)
# - Health check monitoring (Every 5 minutes)
# =====================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
TRIVEXA_DIR="/opt/trivexa"
SCRIPTS_DIR="$TRIVEXA_DIR/scripts"
LOG_DIR="/var/log/trivexa"
BACKUP_DIR="$TRIVEXA_DIR/backups"
USER="${TRIVEXA_USER:-trivexa}"

# Check root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}ERROR: This script must be run as root (use sudo)${NC}"
    exit 1
fi

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}TRIVEXA CRON JOBS SETUP${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Create required directories
echo -e "${YELLOW}Creating directories...${NC}"
mkdir -p "$TRIVEXA_DIR"
mkdir -p "$SCRIPTS_DIR"
mkdir -p "$LOG_DIR"
mkdir -p "$BACKUP_DIR"
echo -e "${GREEN}✓ Directories created${NC}"
echo ""

# =====================================================
# 1. Database Backup Cron Job
# =====================================================
echo -e "${BLUE}1. Setting up database backup cron job...${NC}"

BACKUP_SCRIPT="$SCRIPTS_DIR/backup-database.sh"

if [ ! -f "$BACKUP_SCRIPT" ]; then
    echo -e "${RED}ERROR: Backup script not found: $BACKUP_SCRIPT${NC}"
    echo -e "${YELLOW}Please copy backup-database.sh to $SCRIPTS_DIR${NC}"
    exit 1
fi

# Make script executable
chmod +x "$BACKUP_SCRIPT"
chown "$USER:$USER" "$BACKUP_SCRIPT"

# Add to crontab (Daily at 03:00 AM)
BACKUP_CRON="0 3 * * * $BACKUP_SCRIPT >> $LOG_DIR/backup_cron.log 2>&1"

# Check if already exists
if crontab -u "$USER" -l 2>/dev/null | grep -q "$BACKUP_SCRIPT"; then
    echo -e "${YELLOW}Backup cron job already exists${NC}"
else
    (crontab -u "$USER" -l 2>/dev/null; echo "$BACKUP_CRON") | crontab -u "$USER" -
    echo -e "${GREEN}✓ Backup cron job added (Daily 03:00 AM)${NC}"
fi

echo ""

# =====================================================
# 2. Database Vacuum Cron Job
# =====================================================
echo -e "${BLUE}2. Setting up database vacuum cron job...${NC}"

VACUUM_SCRIPT="$SCRIPTS_DIR/vacuum-database.sh"

if [ ! -f "$VACUUM_SCRIPT" ]; then
    echo -e "${RED}ERROR: Vacuum script not found: $VACUUM_SCRIPT${NC}"
    echo -e "${YELLOW}Please copy vacuum-database.sh to $SCRIPTS_DIR${NC}"
    exit 1
fi

# Make script executable
chmod +x "$VACUUM_SCRIPT"
chown "$USER:$USER" "$VACUUM_SCRIPT"

# Add to crontab (Weekly on Sunday at 02:00 AM)
VACUUM_CRON="0 2 * * 0 $VACUUM_SCRIPT >> $LOG_DIR/vacuum_cron.log 2>&1"

# Check if already exists
if crontab -u "$USER" -l 2>/dev/null | grep -q "$VACUUM_SCRIPT"; then
    echo -e "${YELLOW}Vacuum cron job already exists${NC}"
else
    (crontab -u "$USER" -l 2>/dev/null; echo "$VACUUM_CRON") | crontab -u "$USER" -
    echo -e "${GREEN}✓ Vacuum cron job added (Weekly Sunday 02:00 AM)${NC}"
fi

echo ""

# =====================================================
# 3. Health Check Monitoring (Optional)
# =====================================================
echo -e "${BLUE}3. Setting up health check monitoring...${NC}"

HEALTH_CHECK_SCRIPT="$SCRIPTS_DIR/health-check.sh"

# Create health check script if it doesn't exist
if [ ! -f "$HEALTH_CHECK_SCRIPT" ]; then
    cat > "$HEALTH_CHECK_SCRIPT" << 'HEALTHCHECK_EOF'
#!/bin/bash

# Health check script
API_URL="${API_URL:-http://localhost:3500/api/v1/health}"
LOG_FILE="/var/log/trivexa/health_check.log"

# Make request
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL" 2>&1)

if [ "$RESPONSE" != "200" ]; then
    echo "$(date): Health check FAILED (HTTP $RESPONSE)" >> "$LOG_FILE"

    # Optional: Send alert (uncomment to enable)
    # curl -X POST https://your-slack-webhook \
    #   -H 'Content-Type: application/json' \
    #   -d "{\"text\": \"Trivexa health check failed: HTTP $RESPONSE\"}"
else
    echo "$(date): Health check OK" >> "$LOG_FILE"
fi
HEALTHCHECK_EOF

    chmod +x "$HEALTH_CHECK_SCRIPT"
    chown "$USER:$USER" "$HEALTH_CHECK_SCRIPT"
    echo -e "${GREEN}✓ Health check script created${NC}"
fi

# Add to crontab (Every 5 minutes)
HEALTH_CRON="*/5 * * * * $HEALTH_CHECK_SCRIPT"

# Check if already exists
if crontab -u "$USER" -l 2>/dev/null | grep -q "$HEALTH_CHECK_SCRIPT"; then
    echo -e "${YELLOW}Health check cron job already exists${NC}"
else
    (crontab -u "$USER" -l 2>/dev/null; echo "$HEALTH_CRON") | crontab -u "$USER" -
    echo -e "${GREEN}✓ Health check cron job added (Every 5 minutes)${NC}"
fi

echo ""

# =====================================================
# 4. Log Rotation Setup
# =====================================================
echo -e "${BLUE}4. Setting up log rotation...${NC}"

LOGROTATE_CONF="/etc/logrotate.d/trivexa"

if [ -f "scripts/logrotate-trivexa.conf" ]; then
    cp scripts/logrotate-trivexa.conf "$LOGROTATE_CONF"
    echo -e "${GREEN}✓ Logrotate configuration installed${NC}"
elif [ ! -f "$LOGROTATE_CONF" ]; then
    # Create basic logrotate config
    cat > "$LOGROTATE_CONF" << 'LOGROTATE_EOF'
/var/log/trivexa/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 trivexa trivexa
    sharedscripts
    postrotate
        systemctl reload pm2-trivexa > /dev/null 2>&1 || true
    endscript
}
LOGROTATE_EOF
    echo -e "${GREEN}✓ Basic logrotate configuration created${NC}"
else
    echo -e "${YELLOW}Logrotate configuration already exists${NC}"
fi

# Test logrotate
logrotate -d "$LOGROTATE_CONF" > /dev/null 2>&1 && \
    echo -e "${GREEN}✓ Logrotate configuration valid${NC}" || \
    echo -e "${RED}✗ Logrotate configuration has errors${NC}"

echo ""

# =====================================================
# 5. Disk Space Monitoring (Optional)
# =====================================================
echo -e "${BLUE}5. Setting up disk space monitoring...${NC}"

DISK_CHECK_SCRIPT="$SCRIPTS_DIR/check-disk-space.sh"

# Create disk space check script
cat > "$DISK_CHECK_SCRIPT" << 'DISKCHECK_EOF'
#!/bin/bash

# Check disk space and alert if > 80% full
THRESHOLD=80
USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')

if [ "$USAGE" -gt "$THRESHOLD" ]; then
    echo "$(date): ALERT - Disk usage at ${USAGE}%" >> /var/log/trivexa/disk_space.log

    # Optional: Send alert
    # curl -X POST https://your-slack-webhook \
    #   -H 'Content-Type: application/json' \
    #   -d "{\"text\": \"Trivexa server disk usage: ${USAGE}%\"}"
fi
DISKCHECK_EOF

chmod +x "$DISK_CHECK_SCRIPT"
chown "$USER:$USER" "$DISK_CHECK_SCRIPT"

# Add to crontab (Daily at 08:00 AM)
DISK_CRON="0 8 * * * $DISK_CHECK_SCRIPT"

if crontab -u "$USER" -l 2>/dev/null | grep -q "$DISK_CHECK_SCRIPT"; then
    echo -e "${YELLOW}Disk check cron job already exists${NC}"
else
    (crontab -u "$USER" -l 2>/dev/null; echo "$DISK_CRON") | crontab -u "$USER" -
    echo -e "${GREEN}✓ Disk space check added (Daily 08:00 AM)${NC}"
fi

echo ""

# =====================================================
# Summary
# =====================================================
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}CRON JOBS SETUP COMPLETE${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${GREEN}✓ All cron jobs configured successfully!${NC}"
echo ""
echo -e "${YELLOW}Configured Cron Jobs:${NC}"
echo ""
echo "  1. Database Backup:     Daily at 03:00 AM"
echo "  2. Database Vacuum:     Weekly Sunday 02:00 AM"
echo "  3. Health Check:        Every 5 minutes"
echo "  4. Disk Space Check:    Daily at 08:00 AM"
echo "  5. Log Rotation:        Automatic (logrotate.d)"
echo ""
echo -e "${YELLOW}View cron jobs:${NC}"
echo "  crontab -u $USER -l"
echo ""
echo -e "${YELLOW}View logs:${NC}"
echo "  tail -f $LOG_DIR/backup_cron.log"
echo "  tail -f $LOG_DIR/vacuum_cron.log"
echo "  tail -f $LOG_DIR/health_check.log"
echo ""
echo -e "${YELLOW}Test cron jobs manually:${NC}"
echo "  $BACKUP_SCRIPT"
echo "  $VACUUM_SCRIPT"
echo "  $HEALTH_CHECK_SCRIPT"
echo ""
echo -e "${GREEN}Setup complete!${NC}"
echo ""

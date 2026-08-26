#!/bin/bash

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/db_backups"
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

export PGPASSWORD="${DB_PASS}"

# Run pg_dump with compression
pg_dump -h "${DB_HOST}" -U "${DB_USER}" -d "${DB_NAME}" | gzip > "$BACKUP_FILE"

# Check if backup succeeded
if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo "Backup completed: $BACKUP_FILE"
else
    echo "Backup failed!" >&2
    rm -f "$BACKUP_FILE"
    exit 1
fi

# Remove backups older than 3 days
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +3 -delete

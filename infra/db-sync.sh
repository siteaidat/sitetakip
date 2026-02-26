#!/bin/bash
set -euo pipefail

DUMP_FILE="sitetakip-$(date +%Y%m%d-%H%M%S).sql.gz"
S3_KEY="dumps/${DUMP_FILE}"

echo "=== DB Sync: Prod → Staging ==="
echo "Started at $(date -u '+%Y-%m-%d %H:%M:%S UTC')"

# 1) Dump production DB
echo "--- Step 1: Dumping production DB ---"
PGPASSWORD="${PROD_DB_PASS}" pg_dump \
  -h "${PROD_DB_HOST}" \
  -p "${PROD_DB_PORT}" \
  -U "${PROD_DB_USER}" \
  -d "${PROD_DB_NAME}" \
  --no-owner \
  --no-privileges \
  --clean \
  --if-exists \
  | gzip > "/tmp/${DUMP_FILE}"

DUMP_SIZE=$(du -h "/tmp/${DUMP_FILE}" | cut -f1)
echo "Dump complete: ${DUMP_FILE} (${DUMP_SIZE})"

# 2) Upload to S3
echo "--- Step 2: Uploading to S3 ---"
aws s3 cp "/tmp/${DUMP_FILE}" "s3://${S3_BUCKET}/${S3_KEY}"
echo "Uploaded to s3://${S3_BUCKET}/${S3_KEY}"

# 3) Restore to staging DB
echo "--- Step 3: Restoring to staging DB ---"
gunzip -c "/tmp/${DUMP_FILE}" | PGPASSWORD="${STAGING_DB_PASS}" psql \
  -h "${STAGING_DB_HOST}" \
  -p "${STAGING_DB_PORT}" \
  -U "${STAGING_DB_USER}" \
  -d "${STAGING_DB_NAME}" \
  --single-transaction \
  -v ON_ERROR_STOP=0

echo "--- Restore complete ---"

# 4) Cleanup
rm -f "/tmp/${DUMP_FILE}"

echo "=== DB Sync finished at $(date -u '+%Y-%m-%d %H:%M:%S UTC') ==="

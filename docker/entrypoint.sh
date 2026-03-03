#!/bin/sh
set -e

echo "🔄 Running database migrations..."
node dist/database/run-migrations.js || echo "⚠️  Migration skipped (no pending migrations or script not found)"

echo "🚀 Starting Trivexa Backend..."
exec node dist/main.js

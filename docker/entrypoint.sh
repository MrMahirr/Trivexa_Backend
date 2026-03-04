#!/bin/sh
set -e

echo "🔄 Running database migrations..."
npm run migrate:up || echo "⚠️  Migration skipped (no pending migrations or script not found)"
echo "🚀 Starting Trivexa Backend..."
exec node dist/main.js

#!/bin/sh
set -e

echo "Starting Steamer container initialization..."

# Check if SQLite database file exists in /app/prisma (e.g. if an empty volume was mounted)
if [ ! -s /app/prisma/steamer.db ]; then
  echo "steamer.db not found or 0 bytes in /app/prisma (empty volume mount detected)."
  if [ -f /app/prisma_seed/steamer.db ]; then
    echo "Restoring pre-seeded database with 245 games from /app/prisma_seed/steamer.db..."
    mkdir -p /app/prisma
    cp /app/prisma_seed/steamer.db /app/prisma/steamer.db
    if [ -f /app/prisma_seed/schema.prisma ]; then
      cp /app/prisma_seed/schema.prisma /app/prisma/schema.prisma
    fi
    echo "Database restoration complete."
  else
    echo "No backup seed found. Attempting prisma db push..."
    npx prisma db push --skip-generate || true
  fi
fi

# Ensure correct read/write permissions for the SQLite file
chmod -R 777 /app/prisma 2>/dev/null || true

echo "Starting Next.js server on port 3000..."
exec node server.js

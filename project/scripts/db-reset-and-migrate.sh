#!/usr/bin/env bash
# Run database reset and migrations from project root.
# Removes the migrations folder, regenerates Prisma client, then resets the DB and reapplies migrations.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

MIGRATIONS_DIR="$PROJECT_DIR/infrastructure/database/prisma/migrations"
cd "$PROJECT_DIR"

if [ -d "$MIGRATIONS_DIR" ]; then
  echo "Removing migrations folder..."
  rm -rf "$MIGRATIONS_DIR"
fi

echo "Generating Prisma client..."
bun run db:generate

echo "Creating initial migration..."
bunx prisma migrate dev --schema=./infrastructure/database/prisma/schema.prisma --name init

echo "Resetting database and applying migrations..."
bun run db:reset

echo "Done."

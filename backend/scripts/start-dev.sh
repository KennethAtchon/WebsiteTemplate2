#!/bin/sh
set -e

echo "Generating Prisma client..."
bun run db:generate

echo "Running database migrations..."
bun run db:deploy

echo "Starting development server..."
exec bun run --hot src/index.ts

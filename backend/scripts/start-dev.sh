#!/bin/sh
set -e

echo "Running database migrations..."
bun run db:deploy

echo "Starting development server..."
exec bun run --hot src/index.ts

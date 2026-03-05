#!/bin/bash

# Navigate to root directory and start Docker
cd "$(dirname "$0")/../.."

echo "🚀 Starting Docker Compose..."

# Start docker compose with build to see new changes
docker compose up --build

echo "✅ Docker Compose is now running!"
echo "📊 Current running containers:"
docker ps
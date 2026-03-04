#!/bin/bash

# Navigate to project directory and start Docker
cd "$(dirname "$0")/../../project"

echo "🚀 Starting Docker Compose..."

# Start docker compose with build to see new changes
docker compose up --build

echo "✅ Docker Compose is now running!"
echo "📊 Current running containers:"
docker ps
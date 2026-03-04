#!/bin/bash

# Navigate to project directory and restart Docker with persistent volumes (WSL compatible)
cd "$(dirname "$0")/../../project"

echo "🔄 DOCKER RESTART - Preserving Persistent Volumes"

# Stop current containers
echo "Stopping containers..."
docker compose down

# Clean up orphaned containers and unused images
echo "Cleaning up containers and unused images..."
docker container prune -f
docker image prune -f

# Remove build cache
echo "Removing build cache..."
docker builder prune -af

echo "✅ Docker cleanup complete (volumes preserved)!"
echo ""
echo "🚀 Starting Docker Compose..."

# Start docker compose fresh but preserve volumes
docker compose up -d --build

echo "✅ Docker Compose is now running!"
echo "📊 Current running containers:"
docker ps
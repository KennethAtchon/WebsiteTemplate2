#!/bin/bash

# Navigate to root directory and completely nuke Docker then start fresh (WSL compatible)
cd "$(dirname "$0")/../.."

echo "🔥 NUCLEAR DOCKER CLEANUP - Removing EVERYTHING 🔥"

# Stop ALL running containers
echo "Stopping all containers..."
docker stop $(docker ps -aq) 2>/dev/null || true

# Remove ALL containers (running and stopped)
echo "Removing all containers..."
docker rm $(docker ps -aq) 2>/dev/null || true

# Remove ALL images
echo "Removing all images..."
docker rmi $(docker images -q) 2>/dev/null || true

# Remove ALL volumes
echo "Removing all volumes..."
docker volume rm $(docker volume ls -q) 2>/dev/null || true

# Remove ALL networks (except default ones)
echo "Removing all custom networks..."
docker network rm $(docker network ls -q --filter type=custom) 2>/dev/null || true

# System prune everything with force
echo "Running system prune..."
docker system prune -af --volumes

# Remove build cache
echo "Removing build cache..."
docker builder prune -af

# Final cleanup
echo "Final cleanup..."
docker container prune -f
docker image prune -af
docker volume prune -f
docker network prune -f

echo "✅ Docker has been completely nuked!"
echo ""
echo "🚀 Starting fresh Docker Compose setup..."
echo "Current directory: $(pwd)"
echo "Checking for .env file:"
ls -la .env* 2>/dev/null || echo "No .env files found"

# Start docker compose fresh
docker compose down --volumes --remove-orphans
docker compose up -d --build

echo "✅ Docker Compose is now running fresh!"
echo "📊 Current running containers:"
docker ps
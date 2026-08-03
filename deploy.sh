#!/usr/bin/env bash
set -e

# Variables – adjust as needed
REPO_DIR="/home/ec2-user/deployflow"

# Ensure we are in the repo directory
cd "$REPO_DIR"

# Stop and remove any existing containers
if docker compose ls > /dev/null 2>&1; then
  docker compose down --remove-orphans
fi

# Pull latest code from the main branch
if [ -d ".git" ]; then
  git fetch --all
  git reset --hard origin/main
else
  echo "Repository not a git repo – skipping git pull"
fi

# Build and start containers
docker compose build --no-cache
docker compose up -d

# Optional: give containers a moment to start
sleep 5

# Health check (optional)
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health || true)
if [ "$STATUS" -ne 200 ]; then
  echo "⚠️ Health check failed (status $STATUS)"
else
  echo "✅ Health check passed"
fi

echo "Deploy script completed"

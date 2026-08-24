#!/usr/bin/env bash
set -e

# ==============================================================================
# DeployFlow EC2 Host Setup & Container Orchestration Script
# ==============================================================================
# Controls DeployFlow UI on port 8000
# User project containers are automatically hosted on ports 8001-9000
# Docker Hub registry: pradeepmk799/<repo>:latest
# Zero Database: Direct docker ps / docker stats engine
# ==============================================================================

echo "🚀 [DeployFlow] Initializing EC2 Host Deployment Engine..."

# 1. Update and install Docker if not present
if ! command -v docker &> /dev/null; then
  echo "📦 Installing Docker Engine & BuildKit..."
  sudo apt-get update -y || sudo yum update -y
  sudo apt-get install -y docker.io || sudo yum install -y docker
  sudo systemctl start docker
  sudo systemctl enable docker
  sudo usermod -aG docker $USER
fi

echo "🐳 Docker Engine verified: $(docker --version)"

# 2. Stop and remove existing DeployFlow container if running
if [ $(sudo docker ps -aq -f name=deployflow-app) ]; then
  echo "🛑 Stopping existing DeployFlow container..."
  sudo docker stop deployflow-app || true
  sudo docker rm deployflow-app || true
fi

# 3. Pull latest DeployFlow image from Docker Hub
echo "📥 Pulling latest image from Docker Hub..."
sudo docker pull pradeepmk799/deployflow:latest || true

# 4. Run DeployFlow container on port 8000 with Docker Socket Mounted
# (Enables DeployFlow to run docker ps, docker stats, and docker run for ports 8001-9000)
echo "⚡ Launching DeployFlow control plane on http://$(curl -s http://checkip.amazonaws.com || echo '13.21.45.43'):8000 ..."

sudo docker run -d \
  --name deployflow-app \
  -p 8000:8000 \
  -e PORT=8000 \
  -e NODE_ENV=production \
  -e EC2_HOST_IP="$(curl -s http://checkip.amazonaws.com || echo '13.21.45.43')" \
  -e DOCKER_HUB_USER="pradeepmk799" \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --restart unless-stopped \
  pradeepmk799/deployflow:latest

echo ""
echo "=============================================================================="
echo "✅ DeployFlow is LIVE and running on AWS EC2!"
echo "🌐 Control Dashboard: http://$(curl -s http://checkip.amazonaws.com || echo '13.21.45.43'):8000"
echo "📦 Hosted Project Ports: http://$(curl -s http://checkip.amazonaws.com || echo '13.21.45.43'):8001 -> :9000"
echo "⚡ Direct Docker Engine: Real-time 'docker ps' & 'docker stats' enabled."
echo "=============================================================================="

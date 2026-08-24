import React, { useState } from 'react';
import {
  Server,
  Cloud,
  Box,
  Terminal,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Layers,
  Zap,
  Globe,
  Lock
} from 'lucide-react';

export const DocsGuideView: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const ec2InstallScript = `# 1. Update package manager and install Docker on Amazon Linux 2023 / AL2
sudo dnf update -y
sudo dnf install docker -y

# 2. Start and enable Docker service on boot
sudo systemctl enable --now docker

# 3. Add ec2-user to docker group to run docker commands without sudo
sudo usermod -aG docker ec2-user
newgrp docker

# 4. Verify Docker installation
docker --version`;

  const ec2UbuntuScript = `# 1. Update packages and install Docker on Ubuntu 22.04 / 24.04
sudo apt-get update -y
sudo apt-get install -y docker.io

# 2. Start and enable Docker service
sudo systemctl enable --now docker

# 3. Add ubuntu user to docker group
sudo usermod -aG docker ubuntu
newgrp docker

# 4. Verify installation
docker --version`;

  const dockerHubPipeline = `# Step 1: Build Docker image locally or on build server
docker build -t pradeepmk799/my-fastapi-app:latest .

# Step 2: Push to Docker Hub public repository
docker push pradeepmk799/my-fastapi-app:latest

# Step 3: On AWS EC2 host (e.g., 13.21.45.43), pull the image
docker pull pradeepmk799/my-fastapi-app:latest

# Step 4: Run container on a dedicated project port (e.g. 8001)
docker run -d --name my-fastapi-app -p 8001:80 --restart unless-stopped pradeepmk799/my-fastapi-app:latest

# Step 5: Test live endpoint (from your browser or terminal)
curl http://13.21.45.43:8001/`;

  const githubActionsWorkflow = `name: DeployFlow CI/CD Pipeline (Docker Hub & AWS EC2)

on:
  push:
    branches:
      - main
      - master
  workflow_dispatch:

env:
  DOCKER_IMAGE: pradeepmk799/deployflow
  CONTAINER_NAME: deployflow-app
  APP_PORT: 8000

jobs:
  build-and-push:
    name: 🐳 Build & Push Docker Image
    runs-on: ubuntu-latest
    steps:
      - name: 📥 Check out repository code
        uses: actions/checkout@v4

      - name: ⚙️ Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: 🔑 Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: \${{ secrets.DOCKERHUB_USERNAME }}
          password: \${{ secrets.DOCKERHUB_TOKEN }}

      - name: 🚀 Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: |
            \${{ env.DOCKER_IMAGE }}:latest
            \${{ env.DOCKER_IMAGE }}:\${{ github.sha }}

  deploy-to-ec2:
    name: 🚀 Deploy Container on AWS EC2
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: 🌐 Execute Remote SSH Deployment on EC2
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: \${{ secrets.EC2_HOST }}
          username: \${{ secrets.EC2_USERNAME }}
          key: \${{ secrets.EC2_SSH_KEY }}
          port: \${{ secrets.EC2_PORT || 22 }}
          script: |
            echo "🐳 Pulling latest image: \${{ env.DOCKER_IMAGE }}:latest..."
            sudo docker pull \${{ env.DOCKER_IMAGE }}:latest

            echo "🛑 Stopping previous container..."
            sudo docker stop \${{ env.CONTAINER_NAME }} 2>/dev/null || true
            sudo docker rm \${{ env.CONTAINER_NAME }} 2>/dev/null || true

            echo "⚡ Launching DeployFlow dashboard on port \${{ env.APP_PORT }}..."
            sudo docker run -d \\
              --name \${{ env.CONTAINER_NAME }} \\
              -p \${{ env.APP_PORT }}:\${{ env.APP_PORT }} \\
              -e PORT=\${{ env.APP_PORT }} \\
              -e NODE_ENV=production \\
              -e EC2_HOST_IP="\${{ secrets.EC2_HOST }}" \\
              -v /var/run/docker.sock:/var/run/docker.sock \\
              --restart unless-stopped \\
              \${{ env.DOCKER_IMAGE }}:latest

            echo "✅ Container is running!"
            sudo docker ps --filter "name=\${{ env.CONTAINER_NAME }}"`;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-100">AWS EC2 & Docker Hub Deployment Guide</h1>
            <p className="text-xs text-zinc-400">
              Complete reference for building images, pushing to Docker Hub public repo, and hosting live containers on AWS EC2
            </p>
          </div>
        </div>
      </div>

      {/* Guide 1: Installing Docker on AWS EC2 */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h2 className="text-sm font-bold text-zinc-100">Install Docker on AWS EC2</h2>
          </div>
          <button
            onClick={() => copyCode(ec2InstallScript, 'ec2-install')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg transition-colors cursor-pointer"
          >
            {copiedId === 'ec2-install' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedId === 'ec2-install' ? 'Copied' : 'Copy AL2 / AL2023 Script'}</span>
          </button>
        </div>

        <p className="text-xs text-zinc-400">
          SSH into your AWS EC2 instance (<code className="text-emerald-400 font-mono">ssh -i key.pem ec2-user@13.21.45.43</code>) and execute the following commands to install and start the Docker service:
        </p>

        <pre className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs font-mono text-emerald-400 overflow-x-auto">
          {ec2InstallScript}
        </pre>

        <div className="pt-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 pb-1">
            <span>For Ubuntu EC2 instances (Ubuntu 22.04 / 24.04 LTS):</span>
            <button
              onClick={() => copyCode(ec2UbuntuScript, 'ec2-ubuntu')}
              className="text-emerald-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
            >
              {copiedId === 'ec2-ubuntu' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>Copy Ubuntu Script</span>
            </button>
          </div>
          <pre className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-[11px] font-mono text-zinc-300 overflow-x-auto">
            {ec2UbuntuScript}
          </pre>
        </div>
      </div>

      {/* Guide 2: AWS Security Group Rule (Opening Ports 8080, 8081, etc.) */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4 shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
            2
          </div>
          <h2 className="text-sm font-bold text-zinc-100">Configure AWS EC2 Security Group (Inbound Ports)</h2>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          In order to access your live application at <code className="text-emerald-400 font-mono font-bold">http://13.21.45.43:8080</code> from your web browser, ensure the security group attached to your EC2 instance allows incoming traffic on port <strong>8080</strong> (or the port range <strong>8080-8099</strong> for hosting multiple apps):
        </p>

        <div className="rounded-xl border border-zinc-800 overflow-hidden font-mono text-xs">
          <table className="w-full text-left">
            <thead className="bg-zinc-900 text-zinc-400 text-[11px] border-b border-zinc-800">
              <tr>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Protocol</th>
                <th className="py-2.5 px-4">Port Range</th>
                <th className="py-2.5 px-4">Source</th>
                <th className="py-2.5 px-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              <tr className="hover:bg-zinc-900/50">
                <td className="py-2.5 px-4 text-emerald-400 font-semibold">Custom TCP</td>
                <td className="py-2.5 px-4">TCP</td>
                <td className="py-2.5 px-4 font-bold text-emerald-300">8080 - 8099</td>
                <td className="py-2.5 px-4">0.0.0.0/0</td>
                <td className="py-2.5 px-4 text-zinc-400">DeployFlow Live Applications</td>
              </tr>
              <tr className="hover:bg-zinc-900/50">
                <td className="py-2.5 px-4 text-zinc-400">SSH</td>
                <td className="py-2.5 px-4">TCP</td>
                <td className="py-2.5 px-4">22</td>
                <td className="py-2.5 px-4">My IP / 0.0.0.0/0</td>
                <td className="py-2.5 px-4 text-zinc-400">SSH Terminal Access</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Guide 3: GitHub Actions Automated CI/CD Workflow (.github/workflows/deploy.yml) */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-emerald-500/30 space-y-4 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <span>GitHub Actions CI/CD Workflow</span>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  .github/workflows/deploy.yml
                </span>
              </h2>
            </div>
          </div>
          <button
            onClick={() => copyCode(githubActionsWorkflow, 'github-actions')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-950 font-bold bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-all shadow-md cursor-pointer"
          >
            {copiedId === 'github-actions' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedId === 'github-actions' ? 'Copied Workflow!' : 'Copy deploy.yml'}</span>
          </button>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          This workflow automatically triggers on every <code className="text-emerald-400 font-mono">git push</code> to your repository. It builds your Docker image, pushes it to Docker Hub as <code className="text-emerald-400 font-mono">latest</code>, and connects via SSH to your AWS EC2 instance to pull and run the updated container:
        </p>

        {/* Required GitHub Secrets */}
        <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
          <span className="text-[11px] font-bold text-zinc-200 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Required GitHub Repository Secrets (Settings $\rightarrow$ Secrets and variables $\rightarrow$ Actions):</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="p-2 rounded bg-zinc-950 border border-zinc-800/80 flex items-center justify-between">
              <span className="text-emerald-400">DOCKERHUB_USERNAME</span>
              <span className="text-zinc-500">e.g. pradeepmk799</span>
            </div>
            <div className="p-2 rounded bg-zinc-950 border border-zinc-800/80 flex items-center justify-between">
              <span className="text-emerald-400">DOCKERHUB_TOKEN</span>
              <span className="text-zinc-500">Docker Hub Access Token</span>
            </div>
            <div className="p-2 rounded bg-zinc-950 border border-zinc-800/80 flex items-center justify-between">
              <span className="text-emerald-400">EC2_HOST</span>
              <span className="text-zinc-500">13.21.45.43</span>
            </div>
            <div className="p-2 rounded bg-zinc-950 border border-zinc-800/80 flex items-center justify-between">
              <span className="text-emerald-400">EC2_USERNAME</span>
              <span className="text-zinc-500">ec2-user (or ubuntu)</span>
            </div>
            <div className="p-2 rounded bg-zinc-950 border border-zinc-800/80 sm:col-span-2 flex items-center justify-between">
              <span className="text-emerald-400">EC2_SSH_KEY</span>
              <span className="text-zinc-500">Content of your .pem private key</span>
            </div>
          </div>
        </div>

        <pre className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed max-h-[380px] overflow-y-auto">
          {githubActionsWorkflow}
        </pre>
      </div>

      {/* Guide 4: Full CI/CD Build -> Push -> Deploy Pipeline */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
              4
            </div>
            <h2 className="text-sm font-bold text-zinc-100">CLI Commands (Build, Push & EC2 Run)</h2>
          </div>
          <button
            onClick={() => copyCode(dockerHubPipeline, 'pipeline')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg transition-colors cursor-pointer"
          >
            {copiedId === 'pipeline' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedId === 'pipeline' ? 'Copied' : 'Copy Commands'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
          {dockerHubPipeline}
        </pre>
      </div>

      {/* Guide 4: Hosting DeployFlow Itself on EC2 */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
              4
            </div>
            <h2 className="text-sm font-bold text-zinc-100">Host DeployFlow Itself on AWS EC2 via Docker</h2>
          </div>
          <button
            onClick={() => copyCode(`docker run -d --name deployflow-app -p 8000:8000 -e PORT=8000 -v /var/run/docker.sock:/var/run/docker.sock --restart unless-stopped pradeepmk799/deployflow:latest`, 'host-deployflow')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg transition-colors cursor-pointer"
          >
            {copiedId === 'host-deployflow' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedId === 'host-deployflow' ? 'Copied' : 'Copy 1-Liner'}</span>
          </button>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          DeployFlow includes a built-in production <code className="text-emerald-400 font-mono">Dockerfile</code> and <code className="text-emerald-400 font-mono">docker-compose.yml</code>. You can run this platform directly on your EC2 instance in a Docker container:
        </p>

        <pre className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs font-mono text-emerald-400 overflow-x-auto">
{`# Option A: Run directly with Docker
docker run -d \\
  --name deployflow-app \\
  -p 8000:8000 \\
  -e PORT=8000 \\
  -e NODE_ENV=production \\
  -e EC2_HOST_IP="13.21.45.43" \\
  -v /var/run/docker.sock:/var/run/docker.sock \\
  --restart unless-stopped \\
  pradeepmk799/deployflow:latest

# Option B: Run with Docker Compose
docker compose up -d`}
        </pre>
      </div>

      {/* Guide 5: Multi-Project Port Allocation */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3 shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
            5
          </div>
          <h2 className="text-sm font-bold text-zinc-100">Deploying Multiple Applications on Different Ports</h2>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          DeployFlow automatically assigns and manages non-conflicting host ports so you can run multiple isolated containerized projects side-by-side on your AWS EC2 instance:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 font-mono text-xs">
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
            <span className="text-emerald-400 font-bold">Project 1 (FastAPI)</span>
            <div className="text-zinc-200 text-[11px]">http://13.21.45.43:8080</div>
            <div className="text-zinc-500 text-[10px]">Port 8080:80</div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
            <span className="text-indigo-400 font-bold">Project 2 (Node Express)</span>
            <div className="text-zinc-200 text-[11px]">http://13.21.45.43:8081</div>
            <div className="text-zinc-500 text-[10px]">Port 8081:80</div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
            <span className="text-amber-400 font-bold">Project 3 (Flask Backend)</span>
            <div className="text-zinc-200 text-[11px]">http://13.21.45.43:8082</div>
            <div className="text-zinc-500 text-[10px]">Port 8082:80</div>
          </div>
        </div>
      </div>
    </div>
  );
};

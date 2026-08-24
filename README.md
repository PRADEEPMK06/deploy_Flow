# DEPLOY_FLOW

**DEPLOY_FLOW** is a lightweight, zero-database container orchestration and CI/CD deployment platform built to automate web application deployments to AWS EC2 instances and Docker Hub.

---

## 🎯 Architecture Overview

```
DEPLOY_FLOW
│
├── .github
│   └── workflows
│       └── deploy-flow.yml       # Production CI/CD workflow for GitHub Actions
│
├── src                           # React 19 + TypeScript + Tailwind CSS Frontend
│   ├── components/               # Modular UI components (Dashboard, Modals, Terminal, Metrics)
│   ├── data/                     # Docker CLI commands reference
│   ├── services/                 # Frontend API client and deployment state engine
│   ├── types/                    # Unified TypeScript type definitions & schemas
│   ├── App.tsx                   # Main layout and view router
│   ├── index.css                 # Global styling with Tailwind CSS
│   └── main.tsx                  # Application bootstrap
│
├── server.ts                     # Express + Docker Engine Control Plane (Zero-DB Architecture)
├── Dockerfile                    # Multi-stage production container build
├── docker-compose.yml            # Docker Compose orchestration
├── deploy-to-ec2.sh              # EC2 deployment and setup bootstrap script
├── .env.example                  # Environment configuration template
└── README.md                     # Documentation
```

---

## 🚀 Port Mapping Convention

| Service | Port | Description |
| :--- | :--- | :--- |
| **DeployFlow Dashboard** | `8000` | Main management UI, CI/CD control plane & Docker API |
| **Hosted Projects** | `8001 – 9000` | Dedicated ingress ports dynamically allocated per container |

---

## ⚡ Key Features

1. **Dual Source Support**:
   - **GitHub Repository**: Clone repo, detect framework, analyze Dockerfile, build image, and deploy.
   - **ZIP Upload**: Extract project files in memory, detect runtime, build container, and host.

2. **Automated Docker Pipeline**:
   - Automated framework & Dockerfile detection.
   - Container build using Docker BuildKit.
   - Push to Docker Hub (`pradeepmk799/<repo>:latest`).
   - Run container on EC2 with port binding (`:8001` to `:9000`).

3. **Zero-Database Architecture**:
   - No external database required.
   - Live container states are derived directly via `docker ps -a`.
   - Real-time CPU%, RAM, and Network I/O queried via `docker stats`.
   - Real-time streaming logs queried via `docker logs`.

---

## 🛠️ How to Run

### Development Mode
```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

### Production Build & Full-Stack Run
```bash
# 1. Build frontend assets
npm run build

# 2. Run backend server (starts dashboard on http://localhost:8000)
npm start
```

### EC2 Production Deployment
```bash
# Run one-command setup on your EC2 instance
chmod +x deploy-to-ec2.sh
./deploy-to-ec2.sh
```

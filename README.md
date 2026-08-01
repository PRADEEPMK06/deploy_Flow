# DeployFlow 🚀

DeployFlow is an automated, GitOps-based deployment and cluster management platform designed to streamline infrastructure provisioning, container orchestration, and continuous delivery workflows.

---

## Architecture Overview

DeployFlow combines a robust Python backend with a modern React frontend, backed by AWS infrastructure provisioned via Terraform:

* **Frontend (`/frontend`)**: React 18, Vite, Tailwind CSS, Lucide React, and Axios for a responsive dashboard interface.
* **Backend (`/backend`)**: Python, FastAPI/Uvicorn, PostgreSQL, and Docker integration for orchestration workflows.
* **Infrastructure (`/terraform`)**: AWS VPC, EC2 control planes, RDS PostgreSQL, ECR, and ECS cluster configuration.

---

## Project Structure

```text
deployflow/
├── backend/                  # FastAPI backend service
├── frontend/                 # React frontend application
├── terraform/                # AWS Infrastructure as Code (IaC)
├── Dockerfile.backend        # Container build definition for backend
└── README.md                 # Project documentation
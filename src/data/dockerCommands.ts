export interface DockerCliCommand {
  category: string;
  name: string;
  command: string;
  description: string;
  params?: string[];
  exampleOutput: string;
}

export const DOCKER_CLI_COMMANDS: DockerCliCommand[] = [
  {
    category: 'AWS EC2 Setup',
    name: 'Install Docker on AWS EC2 (Amazon Linux 2023 / AL2)',
    command: 'sudo dnf update -y && sudo dnf install docker -y && sudo systemctl enable --now docker && sudo usermod -aG docker ec2-user',
    description: 'Installs and enables Docker daemon service on an AWS EC2 instance.',
    exampleOutput: `Installed: docker-25.0.3-1.amzn2023.0.1.x86_64
Complete!
Created symlink /etc/systemd/system/multi-user.target.wants/docker.service → /usr/lib/systemd/system/docker.service.`
  },
  {
    category: 'AWS EC2 Setup',
    name: 'Install Docker on AWS EC2 (Ubuntu 22.04 / 24.04)',
    command: 'sudo apt-get update && sudo apt-get install -y docker.io && sudo systemctl enable --now docker && sudo usermod -aG docker ubuntu',
    description: 'Installs Docker on Ubuntu EC2 and grants non-root execution permissions.',
    exampleOutput: `Setting up docker.io (24.0.5-0ubuntu1) ...
Synchronizing state of docker.service with SysV service script with /lib/systemd/systemd-sysv-install.
Executing: /lib/systemd/systemd-sysv-install enable docker`
  },
  {
    category: 'Docker Hub CI/CD',
    name: 'Push Image to Docker Hub Public Repository',
    command: 'docker push pradeepmk799/my-app:latest',
    description: 'Pushes the locally built Docker image to your public Docker Hub repository.',
    exampleOutput: `The push refers to repository [docker.io/pradeepmk799/my-app]
8f4b23c91d: Pushed
5a120de842: Layer already exists
latest: digest: sha256:a1c87f2e99b45100a7b4 size: 1782`
  },
  {
    category: 'Docker Hub CI/CD',
    name: 'Pull & Run Container on AWS EC2 (Port 8080)',
    command: 'docker pull pradeepmk799/my-app:latest && docker run -d --name my-app -p 8080:80 --restart unless-stopped pradeepmk799/my-app:latest',
    description: 'Pulls the public image onto your EC2 instance and spawns the live container exposed on port 8080 (http://13.21.45.43:8080).',
    exampleOutput: `latest: Pulling from pradeepmk799/my-app
Digest: sha256:a1c87f2e99b45100a7b4
Status: Image is up to date for pradeepmk799/my-app:latest
7b2389d0124f8101aa99cbf71239401249bce74012849012389401234901238a`
  },
  {
    category: 'Container Operations',
    name: 'List Active Containers & Ports',
    command: 'docker ps --format "table {{.ID}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}"',
    description: 'Lists all running Docker containers with host port mapping and health status.',
    exampleOutput: `CONTAINER ID   IMAGE                          PORTS                    STATUS
c7f920a1bc34   pradeepmk799/my-app:latest     0.0.0.0:8080->80/tcp     Up 14 minutes (healthy)
8e19b441da02   pradeepmk799/api-v2:latest     0.0.0.0:8081->80/tcp     Up 5 minutes (healthy)`
  },
  {
    category: 'Images & Build',
    name: 'Build Container Image with BuildKit',
    command: 'DOCKER_BUILDKIT=1 docker build -t pradeepmk799/my-app:latest .',
    description: 'Builds a Docker image using high-speed BuildKit engine.',
    exampleOutput: `[+] Building 2.1s (9/9) FINISHED
 => [internal] load build definition from Dockerfile
 => [1/4] FROM docker.io/library/python:3.11-slim
 => [2/4] WORKDIR /app
 => [3/4] COPY requirements.txt .
 => [3/4] RUN pip install --no-cache-dir -r requirements.txt
 => [4/4] COPY . .
 => exporting to image: docker.io/pradeepmk799/my-app:latest`
  },
  {
    category: 'Logs & Inspection',
    name: 'Follow Live Container Logs',
    command: 'docker logs -f --tail 100 my-app',
    description: 'Streams live stdout and stderr logs from the running container.',
    exampleOutput: `INFO:     Started server process [1]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:80 (Press CTRL+C to quit)
INFO:     13.21.45.43:54912 - "GET / HTTP/1.1" 200 OK`
  },
  {
    category: 'Lifecycle & Control',
    name: 'Restart Container',
    command: 'docker restart my-app',
    description: 'Gracefully stops and restarts the container.',
    exampleOutput: `my-app`
  },
  {
    category: 'Lifecycle & Control',
    name: 'Stop Container',
    command: 'docker stop my-app',
    description: 'Sends SIGTERM signal to cleanly stop the container.',
    exampleOutput: `my-app`
  }
];

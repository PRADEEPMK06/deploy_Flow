import React, { useState } from 'react';
import { Deployment, DeploymentLog } from '../types/deployflow';
import { StatusBadge } from './StatusBadge';
import { LogsTerminal } from './LogsTerminal';
import { MonitoringView } from './MonitoringView';
import { LiveAppPreview } from './LiveAppPreview';
import {
  X,
  ExternalLink,
  RotateCw,
  Power,
  Trash2,
  Github,
  FileArchive,
  Terminal,
  Activity,
  Globe,
  Sliders,
  Server,
  Layers,
  ShieldCheck,
  Copy,
  Check,
  HardDrive,
  Code,
  Cloud,
  Box
} from 'lucide-react';

interface DeploymentDetailModalProps {
  deployment: Deployment;
  logs: DeploymentLog[];
  onClose: () => void;
  onRestart: (id: string) => void;
  onStop: (id: string) => void;
  onDelete: (id: string) => void;
}

export const DeploymentDetailModal: React.FC<DeploymentDetailModalProps> = ({
  deployment,
  logs,
  onClose,
  onRestart,
  onStop,
  onDelete
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'preview' | 'docker-cmd' | 'logs' | 'monitoring' | 'inspect'>(
    ['BUILDING', 'CLONING', 'ANALYZING', 'PUSHING_DOCKER_HUB', 'EC2_DEPLOYING', 'HEALTH_CHECK'].includes(deployment.status)
      ? 'logs'
      : 'overview'
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const isLive = ['QUEUED', 'CLONING', 'ANALYZING', 'BUILDING', 'PUSHING_DOCKER_HUB', 'EC2_DEPLOYING', 'DEPLOYING', 'HEALTH_CHECK'].includes(
    deployment.status
  );

  const isEc2 = deployment.target_env === 'AWS_EC2';
  const liveUrl = deployment.public_url || `http://${deployment.ec2_host_ip || '13.21.45.43'}:${deployment.host_port}`;
  const dockerImage = `${deployment.docker_hub_repo || 'pradeepmk799/my-app'}:${deployment.docker_hub_tag || 'latest'}`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    if (id === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedCmd(id);
      setTimeout(() => setCopiedCmd(null), 2000);
    }
  };

  const dockerRunCommand = `docker run -d \\
  --name ${deployment.container_name || `deployflow-${deployment.id.slice(0, 8)}`} \\
  -p ${deployment.host_port}:${deployment.internal_port} \\
  --cpus="${deployment.cpu_limit || 0.5}" \\
  --memory="${deployment.memory_limit_mb || 512}m" \\
  --restart unless-stopped \\
  ${Object.entries(deployment.env_vars || {})
    .map(([k, v]) => `-e ${k}="${v}"`)
    .join(' ')} \\
  ${dockerImage}`;

  const ec2SetupScript = `# 1. Install Docker on AWS EC2 (Amazon Linux 2023 / AL2)
sudo dnf update -y && sudo dnf install docker -y
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user
newgrp docker

# 2. Pull container from Docker Hub public repository
docker pull ${dockerImage}

# 3. Run container on port ${deployment.host_port}
${dockerRunCommand}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Modal Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-zinc-800 bg-zinc-900/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
              {isEc2 ? <Cloud className="w-5 h-5" /> : <Server className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-zinc-100">{deployment.project_name}</h2>
                <StatusBadge status={deployment.status} size="sm" />
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                  {isEc2 ? `AWS EC2 (${deployment.ec2_host_ip || '13.21.45.43'})` : 'Local Docker'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">
                Port: {deployment.host_port} ➔ Container: {deployment.internal_port} • Image: {dockerImage}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {deployment.status === 'RUNNING' && (
              <>
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow transition-all active:scale-95"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Open Live Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={() => onStop(deployment.id)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors"
                  title="Stop container"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Stop</span>
                </button>
              </>
            )}

            <button
              onClick={() => onRestart(deployment.id)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg transition-colors"
              title="Restart container"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Restart</span>
            </button>

            {confirmDelete ? (
              <div className="flex items-center gap-1.5 p-1 bg-rose-950/80 border border-rose-800 rounded-lg">
                <span className="text-[11px] text-rose-300 font-medium px-1">Confirm delete?</span>
                <button
                  onClick={() => onDelete(deployment.id)}
                  className="px-2 py-0.5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded"
                >
                  Yes
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-0.5 text-xs font-medium bg-zinc-800 text-zinc-300 hover:text-white rounded"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg border border-zinc-800 transition-colors"
                title="Delete deployment & remove container"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Link Banner */}
        <div className="px-6 py-3 bg-emerald-950/20 border-b border-emerald-900/30 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold text-zinc-300">Live Application Link:</span>
            <a
              href={liveUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-mono text-emerald-400 hover:text-emerald-300 bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-800 font-bold flex items-center gap-1.5"
            >
              {liveUrl}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(liveUrl, 'link')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-md transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy URL'}</span>
            </button>
            <a
              href={liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-300 hover:text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-md transition-colors"
            >
              <span>Visit Live App</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 px-6 border-b border-zinc-800 bg-zinc-900/40 text-xs shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'overview'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'preview'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Live Web Preview</span>
          </button>

          <button
            onClick={() => setActiveTab('docker-cmd')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'docker-cmd'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Docker Hub & EC2 Commands</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'logs'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>CI/CD Pipeline Logs</span>
            {isLive && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>}
          </button>

          <button
            onClick={() => setActiveTab('monitoring')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'monitoring'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Live Telemetry</span>
          </button>

          <button
            onClick={() => setActiveTab('inspect')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'inspect'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Container Inspect</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Specs Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                  <span className="text-[11px] text-zinc-400 font-medium">Live Public URL</span>
                  <div className="text-xs font-mono font-bold text-emerald-400 truncate">
                    {liveUrl}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                  <span className="text-[11px] text-zinc-400 font-medium">Deployment Target</span>
                  <div className="text-xs font-semibold text-zinc-200 truncate">
                    {isEc2 ? `AWS EC2 (${deployment.ec2_host_ip || '13.21.45.43'})` : 'Local Docker Desktop'}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                  <span className="text-[11px] text-zinc-400 font-medium">Docker Hub Repository</span>
                  <div className="text-xs font-mono font-semibold text-emerald-400 truncate">
                    {dockerImage}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                  <span className="text-[11px] text-zinc-400 font-medium">Port Ingress</span>
                  <div className="text-xs font-mono font-semibold text-indigo-400">
                    Host :{deployment.host_port} ➔ :{deployment.internal_port}
                  </div>
                </div>
              </div>

              {/* Source & Detection Info */}
              <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Source Code & Docker Configuration</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-zinc-500 text-[11px]">Codebase Location:</span>
                    <div className="text-zinc-200 mt-0.5 truncate">
                      {deployment.source_type === 'GITHUB' ? (
                        <a
                          href={deployment.github_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          {deployment.github_url} (branch: {deployment.github_branch || 'main'})
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span>ZIP Archive: {deployment.zip_filename}</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-zinc-500 text-[11px]">Detected Stack:</span>
                    <div className="text-zinc-200 mt-0.5">
                      {deployment.detected_app?.language} ({deployment.detected_app?.framework})
                    </div>
                  </div>
                </div>
              </div>

              {/* Generated Dockerfile Preview */}
              <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                    <Code className="w-4 h-4 text-emerald-400" />
                    <span>Container Dockerfile</span>
                  </h3>
                  <button
                    onClick={() => copyToClipboard(deployment.dockerfile_content || '', 'dockerfile')}
                    className="text-zinc-400 hover:text-white flex items-center gap-1 font-mono text-[11px]"
                  >
                    {copiedCmd === 'dockerfile' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy Dockerfile</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-emerald-400 overflow-x-auto">
                  {deployment.dockerfile_content}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <LiveAppPreview deployment={deployment} />
          )}

          {activeTab === 'docker-cmd' && (
            <div className="space-y-6">
              {/* Step 1: Docker Hub Push Command */}
              <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-zinc-200 flex items-center gap-2">
                    <Box className="w-4 h-4 text-emerald-400" />
                    <span>1. Build & Push to Docker Hub Public Repository</span>
                  </h3>
                  <button
                    onClick={() => copyToClipboard(`docker build -t ${dockerImage} . && docker push ${dockerImage}`, 'push')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-md transition-colors"
                  >
                    {copiedCmd === 'push' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCmd === 'push' ? 'Copied' : 'Copy Push Command'}</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-emerald-400 overflow-x-auto">
                  {`# Build Docker image
docker build -t ${dockerImage} .

# Push image to Docker Hub
docker push ${dockerImage}`}
                </pre>
              </div>

              {/* Step 2: AWS EC2 Pull & Run Command */}
              <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-zinc-200 flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-emerald-400" />
                    <span>2. Pull & Run on AWS EC2 Host ({deployment.ec2_host_ip || '13.21.45.43'})</span>
                  </h3>
                  <button
                    onClick={() => copyToClipboard(dockerRunCommand, 'run')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-md transition-colors"
                  >
                    {copiedCmd === 'run' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCmd === 'run' ? 'Copied' : 'Copy Run Command'}</span>
                  </button>
                </div>
                <p className="text-xs text-zinc-400">
                  Run on your AWS EC2 instance to spawn the container on port <strong>{deployment.host_port}</strong>.
                </p>
                <pre className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-emerald-400 overflow-x-auto">
                  {`# Pull latest image from Docker Hub
docker pull ${dockerImage}

# Run container on port ${deployment.host_port}
${dockerRunCommand}`}
                </pre>
              </div>

              {/* Step 3: Full EC2 One-Liner Script */}
              <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-zinc-200 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>3. Complete AWS EC2 Setup & Execution Script</span>
                  </h3>
                  <button
                    onClick={() => copyToClipboard(ec2SetupScript, 'ec2script')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-md transition-colors"
                  >
                    {copiedCmd === 'ec2script' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCmd === 'ec2script' ? 'Copied' : 'Copy Full Script'}</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 overflow-x-auto">
                  {ec2SetupScript}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="h-full">
              <LogsTerminal logs={logs} deploymentId={deployment.id} isLive={isLive} />
            </div>
          )}

          {activeTab === 'monitoring' && (
            <MonitoringView
              deployment={deployment}
              onRestart={() => onRestart(deployment.id)}
              onStop={() => onStop(deployment.id)}
            />
          )}

          {activeTab === 'inspect' && (
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-emerald-400 overflow-x-auto space-y-2">
              <div className="text-zinc-400 text-[11px] pb-2 border-b border-zinc-800">
                # Container inspect payload for {deployment.container_name}
              </div>
              <pre>
                {JSON.stringify(
                  {
                    Id: deployment.container_id || 'c7f920a1bc34',
                    Target: deployment.target_env,
                    HostIp: deployment.ec2_host_ip || '13.21.45.43',
                    DockerHubImage: dockerImage,
                    PublicUrl: liveUrl,
                    Created: deployment.created_at,
                    State: {
                      Status: deployment.status.toLowerCase(),
                      Running: deployment.status === 'RUNNING',
                      Health: {
                        Status: deployment.health_status.toLowerCase()
                      }
                    },
                    HostConfig: {
                      PortBindings: {
                        [`${deployment.internal_port}/tcp`]: [{ HostIp: '0.0.0.0', HostPort: `${deployment.host_port}` }]
                      },
                      NanoCpus: (deployment.cpu_limit || 0.5) * 1e9,
                      Memory: (deployment.memory_limit_mb || 512) * 1024 * 1024
                    }
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

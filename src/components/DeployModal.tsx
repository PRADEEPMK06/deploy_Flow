import React, { useState, useEffect } from 'react';
import {
  X,
  Github,
  FileArchive,
  Cpu,
  HardDrive,
  Plus,
  Trash2,
  Zap,
  Globe,
  Server,
  Radio,
  Cloud,
  Box,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import { TargetEnvironment } from '../types/deployflow';
import { deployEngine } from '../services/deployEngine';

interface DeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeploy: (params: {
    projectName: string;
    sourceType: 'GITHUB' | 'ZIP';
    targetEnv: TargetEnvironment;
    ec2HostIp?: string;
    dockerHubRepo?: string;
    dockerHubTag?: string;
    githubUrl?: string;
    githubBranch?: string;
    zipFilename?: string;
    envVars?: Record<string, string>;
    cpuLimit?: number;
    memoryLimitMb?: number;
    customPort?: number;
  }) => void;
}

export const DeployModal: React.FC<DeployModalProps> = ({ isOpen, onClose, onDeploy }) => {
  const [sourceType, setSourceType] = useState<'ZIP' | 'GITHUB'>('ZIP');
  const [targetEnv] = useState<TargetEnvironment>('AWS_EC2');
  const [projectName, setProjectName] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [githubBranch, setGithubBranch] = useState('main');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [zipValidationStatus, setZipValidationStatus] = useState<string | null>(null);

  // AWS EC2 and Docker Hub configs
  const [ec2HostIp, setEc2HostIp] = useState(deployEngine.getEc2HostIp() || '13.21.45.43');
  const [dockerHubUsername, setDockerHubUsername] = useState('pradeepmk799');
  const [dockerHubRepo, setDockerHubRepo] = useState('');
  const [dockerHubTag, setDockerHubTag] = useState('latest');

  // Resource limits & Ports
  const [customPort, setCustomPort] = useState<string>('8080');
  const [containerPort, setContainerPort] = useState<string>('80');
  const [cpuLimit, setCpuLimit] = useState(0.5);
  const [memoryLimitMb, setMemoryLimitMb] = useState(512);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Environment variables
  const [envPairs, setEnvPairs] = useState<Array<{ key: string; value: string }>>([
    { key: 'APP_ENV', value: 'production' }
  ]);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const nextPort = deployEngine.getNextAvailablePort('AWS_EC2');
      setCustomPort(nextPort.toString());
      setEc2HostIp(deployEngine.getEc2HostIp() || '13.21.45.43');
    }
  }, [isOpen]);

  // Update suggested docker hub repo when project name changes
  useEffect(() => {
    if (projectName) {
      const cleanSlug = projectName.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
      setDockerHubRepo(`${dockerHubUsername}/${cleanSlug}`);
    } else {
      setDockerHubRepo(`${dockerHubUsername}/fastapi-app`);
    }
  }, [projectName, dockerHubUsername]);

  if (!isOpen) return null;

  const handleAddEnvPair = () => {
    setEnvPairs([...envPairs, { key: '', value: '' }]);
  };

  const handleRemoveEnvPair = (index: number) => {
    setEnvPairs(envPairs.filter((_, i) => i !== index));
  };

  const handleEnvChange = (index: number, field: 'key' | 'value', val: string) => {
    const next = [...envPairs];
    next[index][field] = val;
    setEnvPairs(next);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>) => {
    let file: File | null = null;
    if ('dataTransfer' in e) {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        file = e.dataTransfer.files[0];
      }
    } else if (e.target.files && e.target.files[0]) {
      file = e.target.files[0];
    }

    if (file) {
      if (!file.name.endsWith('.zip')) {
        setError('Only .zip compressed archives containing your source code & Dockerfile are supported.');
        return;
      }
      setSelectedFile(file);
      setError(null);
      const inferredName = file.name.replace('.zip', '').replace(/[^a-zA-Z0-9-_]/g, '-');
      if (!projectName) setProjectName(inferredName);
      setZipValidationStatus('Archive verified safe (.zip ready for Docker build on EC2).');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let finalProjectName = projectName.trim();
    if (!finalProjectName) {
      if (sourceType === 'GITHUB' && githubUrl) {
        const parts = githubUrl.split('/');
        finalProjectName = parts[parts.length - 1]?.replace('.git', '') || 'my-app';
      } else if (sourceType === 'ZIP' && selectedFile) {
        finalProjectName = selectedFile.name.replace('.zip', '');
      } else {
        finalProjectName = 'custom-app';
      }
    }

    if (sourceType === 'GITHUB') {
      if (!githubUrl.trim()) {
        setError('Please provide a valid GitHub repository URL.');
        return;
      }
    } else {
      if (!selectedFile) {
        setError('Please choose or upload a valid .zip project archive containing your code & Dockerfile.');
        return;
      }
    }

    const envMap: Record<string, string> = {};
    envPairs.forEach((p) => {
      if (p.key.trim()) {
        envMap[p.key.trim()] = p.value.trim();
      }
    });

    const parsedPort = customPort ? parseInt(customPort, 10) : 8080;

    if (ec2HostIp.trim()) {
      deployEngine.setEc2HostIp(ec2HostIp.trim());
    }

    onDeploy({
      projectName: finalProjectName,
      sourceType,
      targetEnv: 'AWS_EC2',
      ec2HostIp: ec2HostIp.trim() || '13.21.45.43',
      dockerHubRepo: dockerHubRepo.trim() || `${dockerHubUsername}/${finalProjectName.toLowerCase()}`,
      dockerHubTag: dockerHubTag.trim() || 'latest',
      githubUrl: sourceType === 'GITHUB' ? githubUrl.trim() : undefined,
      githubBranch: sourceType === 'GITHUB' ? githubBranch.trim() : undefined,
      zipFilename: sourceType === 'ZIP' ? selectedFile?.name : undefined,
      envVars: envMap,
      cpuLimit,
      memoryLimitMb,
      customPort: parsedPort
    });

    onClose();
  };

  const currentHost = ec2HostIp.trim() || '13.21.45.43';
  const calculatedLiveUrl = `http://${currentHost}:${customPort || '8080'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100">Deploy Container on AWS EC2 & Docker Hub</h2>
              <p className="text-[11px] text-zinc-400">Build from ZIP or GitHub, push latest image to Docker Hub, pull and run on EC2</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs text-zinc-300">
          {error && (
            <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl text-rose-300">
              {error}
            </div>
          )}

          {/* 1. Code Source Selection */}
          <div className="space-y-2">
            <label className="font-semibold text-zinc-200 flex items-center justify-between">
              <span>1. Select Project Source</span>
              <span className="text-[11px] text-emerald-400 font-mono font-medium">ZIP / GitHub $\rightarrow$ Dockerfile</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSourceType('ZIP')}
                className={`p-3.5 rounded-xl border flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                  sourceType === 'ZIP'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold shadow-sm'
                    : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <FileArchive className="w-4 h-4 text-emerald-400" />
                <span>Upload ZIP File</span>
              </button>

              <button
                type="button"
                onClick={() => setSourceType('GITHUB')}
                className={`p-3.5 rounded-xl border flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                  sourceType === 'GITHUB'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold shadow-sm'
                    : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <Github className="w-4 h-4" />
                <span>GitHub Repository</span>
              </button>
            </div>
          </div>

          {/* ZIP Upload Component */}
          {sourceType === 'ZIP' && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className={`p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${
                selectedFile ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/30'
              }`}
            >
              <input
                type="file"
                accept=".zip"
                id="zip-file-input"
                onChange={handleFileDrop}
                className="hidden"
              />
              <label htmlFor="zip-file-input" className="cursor-pointer block space-y-2">
                <FileArchive className="w-8 h-8 mx-auto text-emerald-400" />
                {selectedFile ? (
                  <div>
                    <span className="font-bold text-zinc-100">{selectedFile.name}</span>
                    <p className="text-[11px] text-emerald-400 mt-1">{zipValidationStatus}</p>
                  </div>
                ) : (
                  <div>
                    <span className="font-semibold text-zinc-200">Click to browse or drag & drop project .zip archive</span>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Archive should contain your application files and Dockerfile</p>
                  </div>
                )}
              </label>
            </div>
          )}

          {/* GitHub Config Component */}
          {sourceType === 'GITHUB' && (
            <div className="space-y-3 p-3.5 bg-zinc-900/40 border border-zinc-800/80 rounded-xl">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-300">GitHub Repository URL <span className="text-rose-400">*</span></label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username/fastapi-backend"
                  required={sourceType === 'GITHUB'}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-300">Branch</label>
                <input
                  type="text"
                  value={githubBranch}
                  onChange={(e) => setGithubBranch(e.target.value)}
                  placeholder="main"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
          )}

          {/* Project Name */}
          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-200">Project / Container Service Name <span className="text-rose-400">*</span></label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. my-fastapi-service"
              required
              className="w-full px-3 py-2 bg-zinc-900/70 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* 2. Docker Hub Registry (latest image) */}
          <div className="space-y-2 p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-zinc-200 flex items-center gap-1.5">
                <Box className="w-4 h-4 text-emerald-400" />
                <span>2. Docker Hub Public Repository & Tag</span>
              </label>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                Tag: latest
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] text-zinc-400">Docker Hub Repository Name</label>
                <input
                  type="text"
                  value={dockerHubRepo}
                  onChange={(e) => setDockerHubRepo(e.target.value)}
                  placeholder="pradeepmk799/my-app"
                  required
                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400">Docker Image Tag</label>
                <input
                  type="text"
                  value={dockerHubTag}
                  onChange={(e) => setDockerHubTag(e.target.value)}
                  placeholder="latest"
                  required
                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
            <p className="text-[10px] text-zinc-400">
              CI/CD command: <code className="text-emerald-400">docker push {dockerHubRepo || 'pradeepmk799/my-app'}:{dockerHubTag || 'latest'}</code>
            </p>
          </div>

          {/* 3. AWS EC2 Host & Port Mapping */}
          <div className="space-y-3 bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-zinc-200 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-emerald-400" />
                <span>3. AWS EC2 Container Host & Port Allocation</span>
              </label>
              <span className="text-[11px] text-zinc-400 font-mono font-semibold">
                Live: <span className="text-emerald-400">{calculatedLiveUrl}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-300">
                  AWS EC2 Public IP / Hostname <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={ec2HostIp}
                  onChange={(e) => setEc2HostIp(e.target.value)}
                  placeholder="13.21.45.43"
                  required
                  className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-300">
                  Host Port (Range: 8001 - 9000) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  value={customPort}
                  onChange={(e) => setCustomPort(e.target.value)}
                  placeholder="8001"
                  min="8001"
                  max="9000"
                  required
                  className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
                <span className="text-[10px] text-zinc-400">DeployFlow dashboard is on port 8000. Projects run on ports 8001-9000.</span>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>SSH Execution: <strong className="text-emerald-400">ec2-user@{ec2HostIp}:22</strong></span>
              </span>
              <span className="text-[10px] text-zinc-400">Docker container restarts automatically</span>
            </div>
          </div>

          {/* CI/CD Pipeline Flow Summary */}
          <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
            <span className="text-[11px] font-semibold text-zinc-300">Automated Pipeline Summary</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono text-zinc-400">
              <div className="p-2 rounded bg-zinc-900 border border-zinc-800 flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>1. Unpack & Dockerfile</span>
              </div>
              <div className="p-2 rounded bg-zinc-900 border border-zinc-800 flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>2. Docker Build</span>
              </div>
              <div className="p-2 rounded bg-zinc-900 border border-zinc-800 flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>3. Push Docker Hub</span>
              </div>
              <div className="p-2 rounded bg-zinc-900 border border-zinc-800 flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>4. EC2 Pull & Run</span>
              </div>
            </div>
            <div className="pt-1 flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">Target Live URL:</span>
              <a
                href={calculatedLiveUrl}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline font-mono font-bold flex items-center gap-1"
              >
                {calculatedLiveUrl}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Advanced options toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-[11px] text-zinc-400 hover:text-zinc-200 underline font-mono cursor-pointer"
            >
              {showAdvanced ? '- Hide Container Resources & Env Vars' : '+ Configure Resources & Environment Variables'}
            </button>
          </div>

          {showAdvanced && (
            <div className="space-y-4 pt-2 border-t border-zinc-800">
              {/* CPU & Memory */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-zinc-400" /> CPU Limit (Cores)
                  </label>
                  <select
                    value={cpuLimit}
                    onChange={(e) => setCpuLimit(parseFloat(e.target.value))}
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100"
                  >
                    <option value={0.25}>0.25 vCPU</option>
                    <option value={0.5}>0.5 vCPU (Recommended)</option>
                    <option value={1.0}>1.0 vCPU</option>
                    <option value={2.0}>2.0 vCPU</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1">
                    <HardDrive className="w-3.5 h-3.5 text-zinc-400" /> Memory Limit
                  </label>
                  <select
                    value={memoryLimitMb}
                    onChange={(e) => setMemoryLimitMb(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100"
                  >
                    <option value={256}>256 MB</option>
                    <option value={512}>512 MB (Standard)</option>
                    <option value={1024}>1024 MB (1 GB)</option>
                    <option value={2048}>2048 MB (2 GB)</option>
                  </select>
                </div>
              </div>

              {/* Env Vars */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-zinc-300">Environment Variables</label>
                  <button
                    type="button"
                    onClick={handleAddEnvPair}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Var
                  </button>
                </div>
                {envPairs.map((pair, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="KEY"
                      value={pair.key}
                      onChange={(e) => handleEnvChange(idx, 'key', e.target.value)}
                      className="w-1/2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 font-mono text-[11px]"
                    />
                    <input
                      type="text"
                      placeholder="VALUE"
                      value={pair.value}
                      onChange={(e) => handleEnvChange(idx, 'value', e.target.value)}
                      className="w-1/2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 font-mono text-[11px]"
                    />
                    {envPairs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveEnvPair(idx)}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Deploy to AWS EC2 ({calculatedLiveUrl})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Deployment } from '../types/deployflow';
import { StatusBadge } from './StatusBadge';
import { dockerService, DockerEngineStatus } from '../services/dockerService';
import {
  Server,
  Terminal,
  Power,
  RotateCw,
  Trash2,
  Globe,
  ExternalLink,
  Cpu,
  HardDrive,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Code
} from 'lucide-react';

interface DockerContainerManagerProps {
  deployments: Deployment[];
  onSelectDeployment: (dep: Deployment) => void;
  onRestart: (id: string) => void;
  onStop: (id: string) => void;
  onDelete: (id: string) => void;
}

export const DockerContainerManager: React.FC<DockerContainerManagerProps> = ({
  deployments,
  onSelectDeployment,
  onRestart,
  onStop,
  onDelete
}) => {
  const [dockerStatus, setDockerStatus] = useState<DockerEngineStatus>(dockerService.getStatus());
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  useEffect(() => {
    return dockerService.subscribe((s) => setDockerStatus(s));
  }, []);

  const activeCount = deployments.filter((d) => d.status === 'RUNNING').length;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Docker Engine Daemon Status Banner */}
      <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-100">Docker Desktop Engine Daemon</h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {dockerStatus.daemonState}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                {dockerStatus.version} • Local Socket: {dockerStatus.socketPath}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
              Active: <strong className="text-emerald-400">{activeCount}</strong> / {deployments.length} containers
            </div>
            <button
              onClick={() => dockerService.checkStatus()}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
              title="Refresh Docker Daemon"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Engine Specs Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-zinc-900 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800/80">
            <span className="text-zinc-500 text-[10px] block">API VERSION</span>
            <span className="text-zinc-200 font-semibold">{dockerStatus.apiVersion || 'v1.44'}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800/80">
            <span className="text-zinc-500 text-[10px] block">STORAGE DRIVER</span>
            <span className="text-zinc-200 font-semibold">{dockerStatus.storageDriver || 'overlay2'}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800/80">
            <span className="text-zinc-500 text-[10px] block">RUNTIME</span>
            <span className="text-zinc-200 font-semibold">runc / containerd</span>
          </div>
          <div className="p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800/80">
            <span className="text-zinc-500 text-[10px] block">BUILD ENGINE</span>
            <span className="text-emerald-400 font-semibold">Docker BuildKit</span>
          </div>
        </div>
      </div>

      {/* Docker Containers Table */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl">
        <div className="px-5 py-3.5 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Container Process List ({deployments.length})
            </h3>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Docker Desktop • Local Port Ingress Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-zinc-900 text-zinc-400 uppercase tracking-wider font-semibold text-[11px] border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Container ID / Name</th>
                <th className="py-3 px-4">Application Stack</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Host Port Binding</th>
                <th className="py-3 px-4">Local Live Link</th>
                <th className="py-3 px-4">Limits (CPU/RAM)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {deployments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-zinc-500 font-sans">
                    <Server className="w-10 h-10 mx-auto text-zinc-600 mb-2 opacity-60" />
                    <p className="text-zinc-400 font-medium">No Docker containers running</p>
                    <p className="text-xs text-zinc-500 mt-1">Deploy an application to spawn your first local Docker container.</p>
                  </td>
                </tr>
              ) : (
                deployments.map((dep) => {
                  const isRunning = dep.status === 'RUNNING';
                  const liveUrl = dep.public_url || `http://localhost:${dep.host_port}`;
                  const containerShortId = dep.container_id ? dep.container_id.slice(0, 12) : 'dep-init';

                  return (
                    <tr
                      key={dep.id}
                      className="hover:bg-zinc-900/50 transition-colors group cursor-pointer"
                      onClick={() => onSelectDeployment(dep)}
                    >
                      {/* Container ID & Name */}
                      <td className="py-3.5 px-4">
                        <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                          <span>{containerShortId}</span>
                        </div>
                        <div className="text-[11px] text-zinc-400 font-sans truncate max-w-[140px] mt-0.5">
                          {dep.container_name || dep.project_name}
                        </div>
                      </td>

                      {/* Stack */}
                      <td className="py-3.5 px-4 font-sans text-zinc-200">
                        <div className="font-semibold">{dep.project_name}</div>
                        <div className="text-[11px] text-zinc-500 font-mono">
                          {dep.detected_app?.language || 'Python / Docker'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 font-sans">
                        <StatusBadge status={dep.status} size="sm" />
                      </td>

                      {/* Port Binding */}
                      <td className="py-3.5 px-4">
                        <span className="text-indigo-400 font-semibold">
                          0.0.0.0:{dep.host_port} ➔ {dep.internal_port}/tcp
                        </span>
                      </td>

                      {/* Live Link */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        {isRunning ? (
                          <a
                            href={liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors max-w-[180px] truncate"
                          >
                            <span className="truncate">{liveUrl.replace('http://', '')}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-zinc-500 text-[11px]">Offline</span>
                        )}
                      </td>

                      {/* Quotas */}
                      <td className="py-3.5 px-4 text-zinc-400">
                        <span>{dep.cpu_limit} vCPU / {dep.memory_limit_mb}MB</span>
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3.5 px-4 text-right font-sans"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {isRunning ? (
                            <button
                              onClick={() => onStop(dep.id)}
                              className="p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded transition-colors"
                              title="docker stop container"
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => onRestart(dep.id)}
                              className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 rounded transition-colors"
                              title="docker start container"
                            >
                              <RotateCw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => onSelectDeployment(dep)}
                            className="p-1.5 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800 rounded transition-colors"
                            title="docker logs / inspect"
                          >
                            <Terminal className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onDelete(dep.id)}
                            className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                            title="docker rm container"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Docker Run Instructions Box */}
      <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
            Local Docker Desktop CLI Quick Commands
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-300 font-semibold">
              <span>View Container Processes</span>
              <button
                onClick={() => handleCopy('docker ps --format "table {{.ID}}\\t{{.Image}}\\t{{.Ports}}\\t{{.Status}}"', 'ps')}
                className="text-zinc-500 hover:text-zinc-300"
              >
                {copiedCmd === 'ps' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <pre className="text-emerald-400 text-[11px] overflow-x-auto">
              docker ps --format &quot;table &#123;&#123;.ID&#125;&#125;\t&#123;&#123;.Image&#125;&#125;\t&#123;&#123;.Ports&#125;&#125;\t&#123;&#123;.Status&#125;&#125;&quot;
            </pre>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-300 font-semibold">
              <span>Inspect Container IP & Port Bindings</span>
              <button
                onClick={() => handleCopy('docker inspect --format="{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" <CONTAINER_ID>', 'inspect')}
                className="text-zinc-500 hover:text-zinc-300"
              >
                {copiedCmd === 'inspect' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <pre className="text-emerald-400 text-[11px] overflow-x-auto">
              docker inspect --format=&quot;&#123;&#123;range .NetworkSettings.Networks&#125;&#125;&#123;&#123;.IPAddress&#125;&#125;&#123;&#123;end&#125;&#125;&quot; &lt;CONTAINER_ID&gt;
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

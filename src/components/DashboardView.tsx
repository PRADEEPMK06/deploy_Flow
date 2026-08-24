import React, { useState } from 'react';
import { Deployment } from '../types/deployflow';
import { StatusBadge } from './StatusBadge';
import {
  Server,
  RotateCw,
  Power,
  Trash2,
  Terminal,
  Search,
  CheckCircle2,
  AlertTriangle,
  Github,
  FileArchive,
  Layers,
  ArrowUpRight,
  PlusCircle,
  Cloud,
  Box,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';

interface DashboardViewProps {
  deployments: Deployment[];
  onOpenDeployModal: () => void;
  onSelectDeployment: (dep: Deployment) => void;
  onRestart: (id: string) => void;
  onStop: (id: string) => void;
  onDelete: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  deployments,
  onOpenDeployModal,
  onSelectDeployment,
  onRestart,
  onStop,
  onDelete
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const runningCount = deployments.filter((d) => d.status === 'RUNNING').length;
  const stoppedCount = deployments.filter((d) => d.status === 'STOPPED').length;
  const buildingCount = deployments.filter((d) =>
    ['QUEUED', 'CLONING', 'ANALYZING', 'BUILDING', 'PUSHING_DOCKER_HUB', 'EC2_DEPLOYING', 'DEPLOYING', 'HEALTH_CHECK'].includes(d.status)
  ).length;

  const copyUrl = (e: React.MouseEvent, url: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredDeployments = deployments.filter((d) => {
    const matchesSearch =
      d.project_name.toLowerCase().includes(search.toLowerCase()) ||
      (d.github_url && d.github_url.toLowerCase().includes(search.toLowerCase())) ||
      (d.zip_filename && d.zip_filename.toLowerCase().includes(search.toLowerCase())) ||
      (d.docker_hub_repo && d.docker_hub_repo.toLowerCase().includes(search.toLowerCase())) ||
      (d.public_url && d.public_url.toLowerCase().includes(search.toLowerCase())) ||
      (d.host_port && d.host_port.toString().includes(search));

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'RUNNING' && d.status === 'RUNNING') ||
      (statusFilter === 'BUILDING' &&
        ['QUEUED', 'CLONING', 'ANALYZING', 'BUILDING', 'PUSHING_DOCKER_HUB', 'EC2_DEPLOYING', 'DEPLOYING', 'HEALTH_CHECK'].includes(d.status)) ||
      (statusFilter === 'STOPPED' && d.status === 'STOPPED');

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* 4 Stat Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Deployments */}
        <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Total Applications
            </span>
            <div className="p-2 rounded-lg bg-zinc-900 text-zinc-300">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-zinc-100">{deployments.length}</span>
            <span className="text-xs text-zinc-500 font-mono">Managed containers</span>
          </div>
        </div>

        {/* Card 2: Running Containers */}
        <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Active Containers
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Cloud className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-emerald-400">{runningCount}</span>
            <span className="text-xs text-emerald-500/80 font-mono">Live HTTP 200 OK</span>
          </div>
        </div>

        {/* Card 3: In Pipeline / Stopped */}
        <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Pipelines / Active Builds
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-amber-400">
              {buildingCount > 0 ? `${buildingCount} active` : `${stoppedCount} idle`}
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              {buildingCount > 0 ? 'Docker Hub push/pull' : 'Stopped containers'}
            </span>
          </div>
        </div>

        {/* Card 4: Allocated Port Range */}
        <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Host Port Ingress
            </span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-indigo-400">
              8080..8099
            </span>
            <span className="text-xs text-zinc-500 font-mono">{deployments.length} Ports Allocated</span>
          </div>
        </div>
      </div>

      {/* Deployments Table Section */}
      <div className="space-y-4">
        {/* Table Controls Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-zinc-100">Live Applications & Containers</h3>
            <span className="text-xs font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
              {filteredDeployments.length} total
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects, IPs, ports..."
                className="pl-8 pr-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 w-48 sm:w-60 font-mono"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 focus:outline-none focus:border-emerald-500 font-mono"
            >
              <option value="ALL">All Statuses</option>
              <option value="RUNNING">Running only</option>
              <option value="BUILDING">Building / Pipeline</option>
              <option value="STOPPED">Stopped only</option>
            </select>

            <button
              onClick={onOpenDeployModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all active:scale-95 shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 fill-current" />
              <span>Deploy Application</span>
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900 text-zinc-400 uppercase tracking-wider font-semibold text-[11px] border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Project & Source</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Live URL / Host</th>
                  <th className="py-3 px-4">Docker Hub Repository</th>
                  <th className="py-3 px-4">Latency</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredDeployments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-zinc-500">
                      <div className="space-y-3 max-w-sm mx-auto">
                        <p className="text-zinc-400 font-medium">No deployments found</p>
                        <p className="text-xs text-zinc-500">Deploy from GitHub repo or ZIP archive to build, push to Docker Hub, and run on AWS EC2.</p>
                        <button
                          onClick={onOpenDeployModal}
                          className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-semibold text-xs rounded-lg shadow transition-colors cursor-pointer"
                        >
                          + Create New Deployment
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDeployments.map((dep) => {
                    const isRunning = dep.status === 'RUNNING';
                    const isEc2 = dep.target_env === 'AWS_EC2';
                    const displayUrl = dep.public_url || `http://${dep.ec2_host_ip || '13.21.45.43'}:${dep.host_port}`;
                    const dockerImg = `${dep.docker_hub_repo || 'pradeepmk799/my-app'}:${dep.docker_hub_tag || 'latest'}`;

                    return (
                      <tr
                        key={dep.id}
                        onClick={() => onSelectDeployment(dep)}
                        className="hover:bg-zinc-900/50 transition-colors group cursor-pointer"
                      >
                        {/* Project / Source */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors">
                              {dep.project_name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">
                              {isEc2 ? 'AWS EC2' : 'Local'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] mt-0.5">
                            {dep.source_type === 'GITHUB' ? (
                              <>
                                <Github className="w-3 h-3 text-zinc-400" />
                                <span className="truncate max-w-[180px] font-mono">
                                  {dep.github_url?.replace('https://github.com/', '') || 'GitHub repo'}
                                </span>
                              </>
                            ) : (
                              <>
                                <FileArchive className="w-3 h-3 text-amber-400" />
                                <span className="font-mono">{dep.zip_filename || 'ZIP Archive'}</span>
                              </>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <StatusBadge status={dep.status} size="sm" />
                        </td>

                        {/* Public Endpoint */}
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          {isRunning ? (
                            <div className="flex items-center gap-2">
                              <a
                                href={displayUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-mono font-bold underline underline-offset-2 transition-colors max-w-[200px] truncate"
                              >
                                <span className="truncate">{displayUrl.replace('http://', '')}</span>
                                <ArrowUpRight className="w-3 h-3 shrink-0" />
                              </a>
                              <button
                                onClick={(e) => copyUrl(e, displayUrl, dep.id)}
                                className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                                title="Copy Live URL"
                              >
                                {copiedId === dep.id ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-zinc-500 font-mono text-[11px]">
                              {dep.status === 'STOPPED' ? 'Offline' : `Port ${dep.host_port} (building)`}
                            </span>
                          )}
                        </td>

                        {/* Docker Hub Image */}
                        <td className="py-3.5 px-4 text-zinc-300 font-mono">
                          <div className="flex items-center gap-1.5 text-xs text-zinc-300 truncate max-w-[200px]">
                            <Box className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="truncate">{dockerImg}</span>
                          </div>
                          <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                            Port {dep.host_port} ➔ {dep.internal_port}
                          </div>
                        </td>

                        {/* Health Latency */}
                        <td className="py-3.5 px-4 font-mono">
                          {isRunning ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              {dep.health_latency_ms || 12}ms
                            </span>
                          ) : (
                            <span className="text-zinc-500">N/A</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td
                          className="py-3.5 px-4 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            {isRunning && (
                              <button
                                onClick={() => onStop(dep.id)}
                                className="p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded transition-colors"
                                title="Stop container"
                              >
                                <Power className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => onRestart(dep.id)}
                              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
                              title="Restart deployment"
                            >
                              <RotateCw className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => onSelectDeployment(dep)}
                              className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 rounded transition-colors"
                              title="View CI/CD logs & details"
                            >
                              <Terminal className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => onDelete(dep.id)}
                              className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                              title="Delete deployment"
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
      </div>
    </div>
  );
};

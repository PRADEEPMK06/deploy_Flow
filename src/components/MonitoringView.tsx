import React, { useState, useEffect } from 'react';
import { Deployment, DeploymentMetric } from '../types/deployflow';
import { deployEngine } from '../services/deployEngine';
import {
  Cpu,
  HardDrive,
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  RotateCw,
  Power,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Radio,
  Server
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface MonitoringViewProps {
  deployment: Deployment;
  onRestart: () => void;
  onStop: () => void;
}

export const MonitoringView: React.FC<MonitoringViewProps> = ({
  deployment,
  onRestart,
  onStop
}) => {
  const [metric, setMetric] = useState<DeploymentMetric>(
    deployEngine.getLiveMetricsForDeployment(deployment.id)
  );

  useEffect(() => {
    const updateMetrics = () => {
      setMetric(deployEngine.getLiveMetricsForDeployment(deployment.id));
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 2500);
    return () => clearInterval(interval);
  }, [deployment.id]);

  const memPercent = deployment.memory_limit_mb
    ? Math.min(100, Math.round((metric.memory_used_mb / deployment.memory_limit_mb) * 100))
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Telemetry Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-zinc-100">Live Telemetry Stream</h3>
              <StatusBadge status={deployment.status} size="sm" />
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Container ID: {deployment.container_id || 'N/A'} • Port: {deployment.host_port || 'N/A'}
            </p>
          </div>
        </div>

        {/* Quick Lifecycle Controls */}
        <div className="flex items-center gap-2">
          {deployment.status === 'RUNNING' && (
            <button
              onClick={onStop}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors"
            >
              <Power className="w-3.5 h-3.5" />
              <span>Stop Container</span>
            </button>
          )}

          <button
            onClick={onRestart}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Restart</span>
          </button>
        </div>
      </div>

      {/* 4 Telemetry Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: CPU Utilization */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>CPU Utilization</span>
            </span>
            <span className="text-[11px] font-mono text-zinc-500">{deployment.cpu_limit} vCPU quota</span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-zinc-100">
              {metric.cpu_percent}%
            </span>
            <span className="text-xs text-emerald-400 font-medium">Normal</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div
              className={`h-full transition-all duration-500 ${
                metric.cpu_percent > 80 ? 'bg-rose-500' : metric.cpu_percent > 50 ? 'bg-amber-400' : 'bg-indigo-500'
              }`}
              style={{ width: `${Math.min(100, metric.cpu_percent)}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Memory Usage */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-amber-400" />
              <span>Memory Usage</span>
            </span>
            <span className="text-[11px] font-mono text-zinc-500">{deployment.memory_limit_mb}MB Limit</span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-zinc-100">
              {metric.memory_used_mb}{' '}
              <span className="text-xs font-normal text-zinc-400 font-sans">MB</span>
            </span>
            <span className="text-xs font-mono text-zinc-400">{memPercent}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="h-full bg-amber-400 transition-all duration-500"
              style={{ width: `${memPercent}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Network I/O */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-sky-400" />
              <span>Network I/O</span>
            </span>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Live
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              <ArrowDownRight className="w-4 h-4 text-sky-400" />
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">RX In</div>
                <div className="text-xs font-mono font-semibold text-zinc-200">{metric.net_in_kb} KB/s</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4 text-teal-400" />
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">TX Out</div>
                <div className="text-xs font-mono font-semibold text-zinc-200">{metric.net_out_kb} KB/s</div>
              </div>
            </div>
          </div>
        </div>

        {/* Metric 4: Health & Latency */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Health Probe</span>
            </span>
            <span className="text-[11px] font-mono text-zinc-500">Every 4s</span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {metric.latency_ms}{' '}
              <span className="text-xs font-normal text-zinc-400 font-sans">ms</span>
            </span>
            <span className="text-xs font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
              HTTP 200 OK
            </span>
          </div>

          <div className="text-[11px] text-zinc-500 truncate font-mono">
            Target: http://localhost:{deployment.host_port}/
          </div>
        </div>
      </div>

      {/* Container Infrastructure Specs */}
      <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
        <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
          <Server className="w-4 h-4 text-zinc-400" />
          <span>Container Runtime Specifications</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-1">
            <span className="text-zinc-500 text-[11px]">Docker Container Name</span>
            <div className="text-zinc-200 font-semibold truncate">{deployment.container_name || 'N/A'}</div>
          </div>
          <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-1">
            <span className="text-zinc-500 text-[11px]">Port Mapping</span>
            <div className="text-emerald-400 font-semibold">
              0.0.0.0:{deployment.host_port} ➔ {deployment.internal_port}/tcp
            </div>
          </div>
          <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-1">
            <span className="text-zinc-500 text-[11px]">Restart Policy</span>
            <div className="text-zinc-300 font-semibold">on-failure (max 3 retries)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

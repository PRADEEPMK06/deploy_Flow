import React, { useState } from 'react';
import { Deployment } from '../types/deployflow';
import {
  ExternalLink,
  Globe,
  RotateCw,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Code,
  Sparkles,
  Server,
  Zap
} from 'lucide-react';

interface LiveAppPreviewProps {
  deployment: Deployment;
  onClose?: () => void;
}

export const LiveAppPreview: React.FC<LiveAppPreviewProps> = ({ deployment, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [requestCount, setRequestCount] = useState(1);
  const [activeTab, setActiveTab] = useState<'app' | 'raw_json' | 'headers'>('app');

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(deployment.public_url || `http://localhost:${deployment.host_port}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setRequestCount((prev) => prev + 1);
      setIsRefreshing(false);
    }, 400);
  };

  const isRunning = deployment.status === 'RUNNING';

  return (
    <div className="flex flex-col bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Mock Browser Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={!isRunning || isRefreshing}
            className="p-1 text-zinc-400 hover:text-zinc-200 rounded hover:bg-zinc-800 transition-colors ml-2"
            title="Reload web page"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>

        {/* Address Bar */}
        <div className="flex-1 max-w-xl mx-3">
          <div className="flex items-center justify-between px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-md text-xs font-mono text-zinc-300">
            <div className="flex items-center gap-1.5 truncate">
              <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">
                {deployment.public_url || `http://localhost:${deployment.host_port}`}
              </span>
            </div>
            <button
              onClick={handleCopyUrl}
              className="text-zinc-500 hover:text-zinc-300 p-0.5 transition-colors"
              title="Copy URL"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2">
          {isRunning ? (
            <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 className="w-3 h-3" />
              200 OK
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <AlertTriangle className="w-3 h-3" />
              Container {deployment.status}
            </span>
          )}
        </div>
      </div>

      {/* Sub-view tabs */}
      <div className="flex items-center gap-1 px-4 py-1.5 bg-zinc-900/60 border-b border-zinc-800 text-xs">
        <button
          onClick={() => setActiveTab('app')}
          className={`px-3 py-1 rounded font-medium transition-colors ${
            activeTab === 'app' ? 'bg-zinc-800 text-emerald-400 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Rendered View
        </button>
        <button
          onClick={() => setActiveTab('raw_json')}
          className={`px-3 py-1 rounded font-medium transition-colors ${
            activeTab === 'raw_json' ? 'bg-zinc-800 text-emerald-400 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          API JSON Response
        </button>
        <button
          onClick={() => setActiveTab('headers')}
          className={`px-3 py-1 rounded font-medium transition-colors ${
            activeTab === 'headers' ? 'bg-zinc-800 text-emerald-400 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          HTTP Headers
        </button>
      </div>

      {/* Browser Viewport */}
      <div className="p-6 bg-zinc-950 min-h-[340px] flex flex-col justify-center">
        {!isRunning ? (
          <div className="text-center py-12 space-y-3">
            <Server className="w-12 h-12 text-zinc-600 mx-auto animate-pulse" />
            <div className="text-sm font-semibold text-zinc-300">
              Application is not serving traffic
            </div>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Current status: <span className="text-amber-400 font-mono">{deployment.status}</span>. Start or restart the container to preview the live application.
            </p>
          </div>
        ) : activeTab === 'app' ? (
          <div className="max-w-xl mx-auto w-full p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl space-y-5 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{deployment.app_preview_data?.badge || 'DeployFlow Verified Container'}</span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-zinc-100">
                {deployment.app_preview_data?.title || deployment.project_name}
              </h2>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                {deployment.app_preview_data?.description ||
                  'Your application is containerized, isolated with resource limits, and actively responding on its assigned port.'}
              </p>
            </div>

            {/* Simulated Live Response Box */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-left font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-[11px] text-zinc-500 pb-2 border-b border-zinc-800">
                <span>GET /api/health</span>
                <span className="text-emerald-400">Status 200 OK</span>
              </div>
              <div className="text-emerald-300">
                {JSON.stringify(
                  {
                    ...deployment.app_preview_data?.sampleEndpointResponse,
                    request_id: `req_${requestCount}`,
                    server_time: new Date().toISOString()
                  },
                  null,
                  2
                )}
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleRefresh}
                className="px-4 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-medium transition-colors"
              >
                Send Test Request (#{requestCount})
              </button>
            </div>
          </div>
        ) : activeTab === 'raw_json' ? (
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-xs text-emerald-400 overflow-x-auto">
            <pre>
              {JSON.stringify(
                {
                  deployment_id: deployment.id,
                  project: deployment.project_name,
                  status: deployment.status,
                  container_id: deployment.container_id,
                  host_port: deployment.host_port,
                  internal_port: deployment.internal_port,
                  uptime_seconds: 3600,
                  health: 'PASS',
                  meta: deployment.app_preview_data?.sampleEndpointResponse
                },
                null,
                2
              )}
            </pre>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-xs text-zinc-300 space-y-2">
            <div><span className="text-zinc-500">HTTP/1.1</span> <span className="text-emerald-400">200 OK</span></div>
            <div><span className="text-zinc-500">Server:</span> nginx/1.25.4 (DeployFlow Ingress)</div>
            <div><span className="text-zinc-500">Date:</span> {new Date().toUTCString()}</div>
            <div><span className="text-zinc-500">Content-Type:</span> application/json; charset=utf-8</div>
            <div><span className="text-zinc-500">X-DeployFlow-Container-ID:</span> {deployment.container_id}</div>
            <div><span className="text-zinc-500">X-DeployFlow-Host-Port:</span> {deployment.host_port}</div>
            <div><span className="text-zinc-500">Connection:</span> keep-alive</div>
          </div>
        )}
      </div>
    </div>
  );
};

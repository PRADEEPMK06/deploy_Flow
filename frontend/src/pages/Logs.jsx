import React, { useState } from 'react';
import { Terminal, Download, Trash2, Play, Pause } from 'lucide-react';

export default function Logs() {
  const [isStreaming, setIsStreaming] = useState(true);
  const [logs, setLogs] = useState([
    { timestamp: '21:45:10', level: 'INFO', message: 'DeployFlow control plane initializing on AWS ECS cluster...' },
    { timestamp: '21:45:12', level: 'INFO', message: 'Database connection established successfully with PostgreSQL RDS.' },
    { timestamp: '21:45:15', level: 'SUCCESS', message: 'Container build completed for repository: deployflow-core (tag: latest).' },
    { timestamp: '21:45:20', level: 'INFO', message: 'Routing traffic through Application Load Balancer (ALB)...' },
    { timestamp: '21:46:02', level: 'WARN', message: 'High memory utilization detected on node ip-10-0-1-44.ec2.internal (82%).' },
    { timestamp: '21:47:30', level: 'INFO', message: 'Automated health check passed for service: backend-api (/api/health).' },
  ]);

  const clearLogs = () => setLogs([]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Cluster Logs</h1>
          <p className="text-sm text-slate-400">Real-time system diagnostics and container orchestration output.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`inline-flex items-center space-x-2 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors border ${
              isStreaming 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
            }`}
          >
            {isStreaming ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isStreaming ? 'Streaming Live' : 'Paused'}</span>
          </button>
          <button
            onClick={clearLogs}
            className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-sm font-medium px-3.5 py-2 rounded-lg border border-slate-800 transition-colors"
          >
            <Trash2 className="h-4 w-4 text-slate-400" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Terminal Window */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl font-mono text-xs">
        <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-slate-400">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            <span className="ml-2 text-slate-300 font-sans text-xs">deployflow-cluster-stream@aws-ecs</span>
          </div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">UTF-8</div>
        </div>

        <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-slate-600 italic py-8 text-center">No logs to display...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="flex items-start space-x-3 leading-relaxed">
                <span className="text-slate-500 select-none">[{log.timestamp}]</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  log.level === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400' :
                  log.level === 'WARN' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-sky-500/20 text-sky-400'
                }`}>
                  {log.level}
                </span>
                <span className="text-slate-300">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
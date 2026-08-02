import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  GitBranch, 
  Clock, 
  Terminal, 
  Cpu, 
  RotateCcw, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert,
  Server,
  Download,
  ExternalLink
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const DeploymentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [deployment, setDeployment] = useState({
    id: id || 104,
    repository_name: 'deployflow-backend',
    repository_url: 'https://github.com/pradeepmk/deployflow-backend.git',
    branch: 'main',
    commit_sha: 'a8f9c21e7b4d3',
    status: 'success',
    created_at: '2026-08-01 21:15:42',
    duration: '45s',
    environment: 'production',
    image_tag: 'deployflow_app_104:latest',
    triggered_by: 'Pradeep MK'
  });

  const [logs, setLogs] = useState([
    '[21:15:42] [INFO] Initializing deployment pipeline for ID: 104',
    '[21:15:43] [INFO] Cloning repository https://github.com/pradeepmk/deployflow-backend.git (branch: main)...',
    '[21:15:46] [INFO] Repository cloned successfully. Checked out commit a8f9c21.',
    '[21:15:47] [INFO] Building Docker image deployflow_app_104:latest using Dockerfile...',
    '[21:16:12] [INFO] Docker image built successfully.',
    '[21:16:13] [INFO] Deploying image to Kubernetes cluster (namespace: default)...',
    '[21:16:25] [INFO] Kubernetes rollout completed successfully. Pods are running.',
    '[21:16:27] [SUCCESS] Deployment pipeline finished successfully.'
  ]);

  const [metrics, setMetrics] = useState({
    cpu_usage: 18.4,
    memory_usage: 245.2, // MB
    status_code: 200,
    response_time_ms: 42.5
  });

  const [isRollingBack, setIsRollingBack] = useState(false);
  const [rollbackMessage, setRollbackMessage] = useState(null);

  const handleRollback = async () => {
    if (!window.confirm(`Are you sure you want to rollback deployment #${deployment.id}?`)) {
      return;
    }

    setIsRollingBack(true);
    setRollbackMessage(null);

    try {
      // Simulate API call to RollbackService backend endpoint
      setTimeout(() => {
        setIsRollingBack(false);
        setDeployment(prev => ({ ...prev, status: 'rolled_back' }));
        setRollbackMessage({ success: true, text: 'Successfully rolled back to previous stable deployment (#103).' });
        setLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] [WARNING] Rollback initiated by user.`,
          `[${new Date().toLocaleTimeString()}] [INFO] Reverting Kubernetes deployment to previous revision.`,
          `[${new Date().toLocaleTimeString()}] [SUCCESS] Rollback completed successfully.`
        ]);
      }, 1500);
    } catch (err) {
      setIsRollingBack(false);
      setRollbackMessage({ success: false, text: 'Failed to execute rollback procedure.' });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/deployments"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Back to Deployments"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">Deployment #{deployment.id}</h1>
              <StatusBadge status={deployment.status} size="lg" />
            </div>
            <p className="text-sm text-slate-400 mt-0.5">
              Target Repository: <span className="text-indigo-400 font-medium">{deployment.repository_name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {deployment.status !== 'rolled_back' && (
            <button
              onClick={handleRollback}
              disabled={isRollingBack}
              className="inline-flex items-center space-x-2 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <RotateCcw className={`h-4 w-4 ${isRollingBack ? 'animate-spin' : ''}`} />
              <span>{isRollingBack ? 'Rolling Back...' : 'Rollback Deployment'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Rollback Alert Feedback Message */}
      {rollbackMessage && (
        <div className={`p-4 rounded-xl border text-sm flex items-center space-x-2 ${
          rollbackMessage.success 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          {rollbackMessage.success ? <CheckCircle2 className="h-5 w-5 flex-shrink-0" /> : <XCircle className="h-5 w-5 flex-shrink-0" />}
          <span>{rollbackMessage.text}</span>
        </div>
      )}

      {/* Deployment Metadata Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Branch & Commit</span>
          <div className="flex items-center space-x-2 pt-1">
            <GitBranch className="h-4 w-4 text-indigo-400" />
            <span className="font-mono text-sm text-slate-200">{deployment.branch}</span>
            <span className="text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
              {deployment.commit_sha}
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Build Duration</span>
          <div className="flex items-center space-x-2 pt-1">
            <Clock className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-semibold text-white">{deployment.duration}</span>
            <span className="text-xs text-slate-500">({deployment.created_at})</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Container Image</span>
          <div className="flex items-center space-x-2 pt-1">
            <Server className="h-4 w-4 text-emerald-400" />
            <span className="font-mono text-xs text-slate-200 truncate" title={deployment.image_tag}>
              {deployment.image_tag}
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Environment / Trigger</span>
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded uppercase">
              {deployment.environment}
            </span>
            <span className="text-xs text-slate-400">By {deployment.triggered_by}</span>
          </div>
        </div>

      </div>

      {/* Main Content Layout Grid: Logs & Live Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Terminal Execution Logs */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="bg-slate-900 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="h-4 w-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-white">Execution Logs</h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs text-slate-400 font-mono">Live Stream</span>
            </div>
          </div>

          <div className="p-4 font-mono text-xs text-slate-300 space-y-1.5 h-96 overflow-y-auto bg-slate-950/90">
            {(Array.isArray(logs) ? logs : []).map((log, index) => {
              let colorClass = "text-slate-300";
              if (typeof log === 'string' && log.includes("[SUCCESS]")) colorClass = "text-emerald-400 font-semibold";
              else if (typeof log === 'string' && log.includes("[WARNING]")) colorClass = "text-amber-400 font-semibold";
              else if (typeof log === 'string' && log.includes("[ERROR]")) colorClass = "text-rose-400 font-semibold";
              else if (typeof log === 'string' && log.includes("[INFO]")) colorClass = "text-slate-400";

              return (
                <div key={index} className={`leading-relaxed ${colorClass}`}>
                  {log}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Performance Metrics & Resource Snapshots */}
        <div className="space-y-6">
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Container Metrics</h2>
              <Activity className="h-4 w-4 text-indigo-400" />
            </div>

            <div className="space-y-3 pt-1">
              <div className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-lg flex items-center justify-between">
                <span className="text-xs text-slate-400">CPU Usage</span>
                <span className="text-sm font-bold text-slate-200">{metrics.cpu_usage}%</span>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-lg flex items-center justify-between">
                <span className="text-xs text-slate-400">Memory Allocation</span>
                <span className="text-sm font-bold text-slate-200">{metrics.memory_usage} MB</span>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-lg flex items-center justify-between">
                <span className="text-xs text-slate-400">HTTP Status Code</span>
                <span className="text-sm font-bold text-emerald-400">{metrics.status_code} OK</span>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-lg flex items-center justify-between">
                <span className="text-xs text-slate-400">Avg Response Time</span>
                <span className="text-sm font-bold text-slate-200">{metrics.response_time_ms} ms</span>
              </div>
            </div>
          </div>

          {/* Git Repository Reference Link Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-white">Repository Source</h3>
            <p className="text-xs text-slate-400 truncate">
              {deployment.repository_url}
            </p>
            <div className="pt-1">
              <a 
                href={deployment.repository_url} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300"
              >
                <span>View on GitHub</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default DeploymentDetails;
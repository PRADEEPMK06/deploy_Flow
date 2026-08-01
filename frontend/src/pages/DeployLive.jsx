import React, { useState, useEffect } from 'react';
import { Rocket, Globe, ExternalLink, Terminal, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function DeployLive() {
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [loading, setLoading] = useState(false);
  const [deployments, setDeployments] = useState([]);
  const [error, setError] = useState(null);

  const fetchActiveDeployments = async () => {
    try {
      const res = await axios.get('/api/active-deployments');
      setDeployments(res.data);
    } catch (err) {
      console.error('Failed to fetch live deployments', err);
    }
  };

  useEffect(() => {
    fetchActiveDeployments();
    const interval = setInterval(fetchActiveDeployments, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDeploy = async (e) => {
    e.preventDefault();
    if (!repoUrl) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.post('/api/deploy-live', {
        repo_url: repoUrl,
        branch: branch,
        port: 8080
      });
      setDeployments([res.data, ...deployments]);
      setRepoUrl('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Deployment failed. Make sure Docker is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Live Instant Deployer</h1>
        <p className="text-sm text-slate-400">Paste any GitHub repository link to instantly spin up an isolated container instance with a public URL.</p>
      </div>

      {/* Deployment Form Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <form onSubmit={handleDeploy} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">GitHub Repository URL</label>
              <input
                type="url"
                required
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repository"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Branch</label>
              <input
                type="text"
                required
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors shadow-lg shadow-indigo-600/20"
            >
              <Rocket className="h-4 w-4" />
              <span>{loading ? 'Building & Launching...' : 'Launch Live Instance'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Active Live Instances List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white tracking-tight">Active Live Deployments</h2>
        
        <div className="grid grid-cols-1 gap-4">
          {deployments.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-sm">
              No live container instances running yet. Launch one above!
            </div>
          ) : (
            deployments.map((dep, index) => (
              <div key={index} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                      {dep.id}
                    </span>
                    <span className="inline-flex items-center space-x-1 text-emerald-400 text-xs font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>{dep.status}</span>
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white font-mono break-all">{dep.repo_url}</p>
                  <p className="text-xs text-slate-500 font-mono">Container ID: {dep.container_id}</p>
                </div>

                <div className="flex items-center space-x-3">
                  <a
                    href={dep.public_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-lg shadow-emerald-600/20"
                  >
                    <Globe className="h-4 w-4" />
                    <span>Open Public URL</span>
                    <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
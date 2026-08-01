import React, { useState } from 'react';
import { GitBranch, Plus, ExternalLink, CheckCircle2, Clock } from 'lucide-react';

export default function Repositories() {
  const [repos, setRepos] = useState([
    { id: 1, name: 'deployflow-core', branch: 'main', status: 'Active', lastDeploy: '10 mins ago', url: 'https://github.com/pradeepmk/deployflow' },
    { id: 2, name: 'wild-gaussian-splatting', branch: 'master', status: 'Building', lastDeploy: 'Just now', url: 'https://github.com/pradeepmk/wild-gaussian-splatting' },
    { id: 3, name: 'react-dashboard-ui', branch: 'main', status: 'Active', lastDeploy: '2 hours ago', url: 'https://github.com/pradeepmk/react-dashboard-ui' },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoBranch, setNewRepoBranch] = useState('main');

  const handleAddRepo = (e) => {
    e.preventDefault();
    if (!newRepoName) return;

    const currentRepos = Array.isArray(repos) ? repos : [];
    const newRepo = {
      id: currentRepos.length + 1,
      name: newRepoName,
      branch: newRepoBranch,
      status: 'Active',
      lastDeploy: 'Never',
      url: `https://github.com/pradeepmk/${newRepoName}`
    };

    setRepos([newRepo, ...currentRepos]);
    setNewRepoName('');
    setNewRepoBranch('main');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Repositories</h1>
          <p className="text-sm text-slate-400">Manage connected Git repositories and automated deployment triggers.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-lg shadow-indigo-600/20"
        >
          <Plus className="h-4 w-4" />
          <span>Connect Repository</span>
        </button>
      </div>

      {/* Repository List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-6 font-medium">Repository Name</th>
                <th className="py-3 px-6 font-medium">Branch</th>
                <th className="py-3 px-6 font-medium">Status</th>
                <th className="py-3 px-6 font-medium">Last Deployment</th>
                <th className="py-3 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {!Array.isArray(repos) || repos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500">No repositories connected yet.</td>
                </tr>
              ) : (
                repos.map((repo, index) => (
                  <tr key={repo?.id || index} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-medium text-white flex items-center space-x-3">
                      <div className="p-2 bg-indigo-600/10 border border-indigo-500/20 rounded-lg text-indigo-400">
                        <GitBranch className="h-4 w-4" />
                      </div>
                      <span>{repo?.name || 'Unnamed Repository'}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-300 font-mono text-xs">
                      <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700">{repo?.branch || 'main'}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        repo?.status === 'Active' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {repo?.status === 'Active' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        <span>{repo?.status || 'Unknown'}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-400 text-xs">{repo?.lastDeploy || 'Never'}</td>
                    <td className="py-4 px-6 text-right space-x-3">
                      <a
                        href={repo?.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-slate-400 hover:text-white transition-colors"
                        title="View on GitHub"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Repository Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Connect New Repository</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddRepo} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Repository Name</label>
                <input
                  type="text"
                  required
                  value={newRepoName}
                  onChange={(e) => setNewRepoName(e.target.value)}
                  placeholder="e.g., my-express-app"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Default Branch</label>
                <input
                  type="text"
                  required
                  value={newRepoBranch}
                  onChange={(e) => setNewRepoBranch(e.target.value)}
                  placeholder="main"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-lg shadow-indigo-600/20"
                >
                  Save & Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
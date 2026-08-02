import React, { useState, useEffect } from 'react';
import { Rocket, CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { fetchDeployments, triggerDeployment } from '../services/api';

export default function Deployments() {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeployments();
  }, []);

  const loadDeployments = async () => {
    try {
      const response = await fetchDeployments();
      const data = Array.isArray(response) 
        ? response 
        : (response?.deployments || response?.data || []);
      
      setDeployments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch deployments:', error);
      setDeployments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerBuild = async () => {
    try {
      const response = await triggerDeployment('deployflow-core');
      
      // Extract single deployment object cleanly from any wrapper format
      const newDep = response?.deployment || response?.data || response;

      setDeployments((prev) => {
        const currentList = Array.isArray(prev) ? prev : [];
        // Ensure we only prepend if newDep is a valid non-array object containing deployment properties
        if (newDep && typeof newDep === 'object' && !Array.isArray(newDep)) {
          return [newDep, ...currentList];
        }
        return currentList;
      });
    } catch (error) {
      console.error('Failed to trigger deployment:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Deployments</h1>
          <p className="text-sm text-slate-400">Monitor active container deployments, build histories, and pipeline triggers.</p>
        </div>
        <button
          onClick={handleTriggerBuild}
          className="inline-flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-lg shadow-indigo-600/20"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Trigger New Build</span>
        </button>
      </div>

      {/* Deployments Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-6 font-medium">Deployment ID</th>
                <th className="py-3 px-6 font-medium">Repository</th>
                <th className="py-3 px-6 font-medium">Environment</th>
                <th className="py-3 px-6 font-medium">Commit</th>
                <th className="py-3 px-6 font-medium">Status</th>
                <th className="py-3 px-6 font-medium text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">Loading deployments from backend...</td>
                </tr>
              ) : !Array.isArray(deployments) || deployments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">No deployments recorded yet.</td>
                </tr>
              ) : (
                deployments.map((dep, index) => (
                  <tr key={dep?.id || index} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs text-indigo-400 font-medium">
                      {dep?.id || 'N/A'}
                    </td>
                    <td className="py-4 px-6 font-medium text-white flex items-center space-x-2">
                      <Rocket className="h-4 w-4 text-slate-400" />
                      <span>{dep?.repo || dep?.repository || 'Unknown'}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-300">
                      <span className="bg-slate-800 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-700">
                        {dep?.env || 'production'}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-400">
                      {dep?.commit || 'HEAD'}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        dep?.status === 'Success' || dep?.status === 'success'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : dep?.status === 'Building' || dep?.status === 'building'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {(dep?.status === 'Success' || dep?.status === 'success') && <CheckCircle2 className="h-3 w-3" />}
                        {(dep?.status === 'Building' || dep?.status === 'building') && <Clock className="h-3 w-3" />}
                        {(dep?.status === 'Failed' || dep?.status === 'failed') && <AlertCircle className="h-3 w-3" />}
                        <span>{dep?.status || 'Unknown'}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-slate-400 text-xs">
                      {dep?.time || 'Just now'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
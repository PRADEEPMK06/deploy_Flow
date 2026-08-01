import React, { useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, Wifi, RefreshCw } from 'lucide-react';
import { fetchMetrics } from '../services/api';

export default function Metrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMetrics = async () => {
    try {
      const data = await fetchMetrics();
      setMetrics(data || null);
    } catch (error) {
      console.error('Failed to fetch cluster metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 5000); // Auto-refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const metricsList = metrics ? [
    { label: 'CPU Utilization', value: metrics?.cpu_utilization || '0%', limit: '75% Threshold', icon: Cpu, color: 'text-indigo-400', bg: 'bg-indigo-600/10 border-indigo-500/20' },
    { label: 'Memory Usage', value: metrics?.memory_usage || '0%', limit: '52.5% Used', icon: HardDrive, color: 'text-emerald-400', bg: 'bg-emerald-600/10 border-emerald-500/20' },
    { label: 'Network In/Out', value: `${metrics?.network_in || '0 KB'} / ${metrics?.network_out || '0 KB'}`, limit: 'Normal Load', icon: Wifi, color: 'text-sky-400', bg: 'bg-sky-600/10 border-sky-500/20' },
    { label: 'Cluster Health Score', value: metrics?.health_score || '100%', limit: 'Optimal', icon: Activity, color: 'text-amber-400', bg: 'bg-amber-600/10 border-amber-500/20' },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Cluster Metrics</h1>
          <p className="text-sm text-slate-400">Real-time resource allocation, node performance, and infrastructure diagnostics.</p>
        </div>
        <button
          onClick={loadMetrics}
          className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-sm font-medium px-4 py-2.5 rounded-lg border border-slate-800 transition-colors"
        >
          <RefreshCw className="h-4 w-4 text-slate-400" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {loading && !metrics ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
          Loading metrics from cluster...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.isArray(metricsList) && metricsList.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-400">{item?.label || 'Metric'}</span>
                  <div className={`p-2.5 rounded-lg border ${item?.bg || ''} ${item?.color || ''}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white tracking-tight">{item?.value || 'N/A'}</p>
                  <p className="text-xs text-slate-500 mt-1">{item?.limit || ''}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
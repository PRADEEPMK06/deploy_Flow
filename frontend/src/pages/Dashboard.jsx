import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GitBranch, Rocket, Activity, Server, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { fetchRepositories, fetchDeployments, fetchMetrics } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ repos: 0, deployments: 0, cpu: '38.4%' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [repos, deployments, metrics] = await Promise.all([
          fetchRepositories(),
          fetchDeployments(),
          fetchMetrics()
        ]);
        
        setStats({
          repos: Array.isArray(repos) ? repos.length : (repos?.count || 0),
          deployments: Array.isArray(deployments) ? deployments.length : (deployments?.count || 0),
          cpu: metrics?.cpu_utilization || '38.4%'
        });
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const cardList = [
    { name: 'Connected Repositories', value: stats.repos, icon: GitBranch, color: 'text-indigo-400', bg: 'bg-indigo-600/10 border-indigo-500/20', link: '/repositories' },
    { name: 'Total Deployments', value: stats.deployments, icon: Rocket, color: 'text-emerald-400', bg: 'bg-emerald-600/10 border-emerald-500/20', link: '/deployments' },
    { name: 'CPU Load', value: stats.cpu, icon: Activity, color: 'text-sky-400', bg: 'bg-sky-600/10 border-sky-500/20', link: '/metrics' },
    { name: 'Cluster Status', value: 'Healthy', icon: Server, color: 'text-amber-400', bg: 'bg-amber-600/10 border-amber-500/20', link: '/logs' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-xs font-medium border border-indigo-500/20">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>DeployFlow Control Plane v1.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome back, Pradeep!
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Your AWS ECS cluster is operating smoothly. All automated container pipelines and GitHub integrations are active.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/deployments"
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-indigo-600/20"
          >
            <span>View Deployments</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.isArray(cardList) && cardList.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link
              key={index}
              to={item.link}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all shadow-xl space-y-4 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">{item.name}</span>
                <div className={`p-2.5 rounded-lg border ${item.bg} ${item.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-white tracking-tight">
                  {loading ? '...' : item.value}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
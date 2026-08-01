import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  GitBranch, 
  Cpu, 
  Activity, 
  Settings, 
  Terminal, 
  ShieldAlert, 
  Server,
  Database
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Repositories', path: '/repositories', icon: GitBranch },
    { name: 'Deployments', path: '/deployments', icon: Cpu },
    { name: 'Monitoring', path: '/monitoring', icon: Activity },
    { name: 'Cluster Nodes', path: '/nodes', icon: Server },
    { name: 'Database', path: '/database', icon: Database },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300 min-h-[calc(100vh-4rem)]">
      {/* Sidebar Header / Workspace Info */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-3 bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50">
          <div className="bg-indigo-600/20 text-indigo-400 p-2 rounded-md">
            <Terminal className="h-4 w-4" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Workspace</p>
            <p className="text-sm font-medium text-slate-200 truncate">production-cluster</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Platform Menu
        </p>
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* System Status Footer Widget */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center space-x-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-emerald-400" />
              <span>Security Engine</span>
            </span>
            <span className="text-emerald-400 font-medium">Active</span>
          </div>
          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full w-[84%] rounded-full"></div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Memory Allocated</span>
            <span>8.4 / 10 GB</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
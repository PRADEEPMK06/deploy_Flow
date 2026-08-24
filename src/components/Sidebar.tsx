import React from 'react';
import {
  Rocket,
  Server,
  Activity,
  PlusCircle,
  HardDrive,
  RefreshCw,
  Zap,
  Database,
  Terminal,
  BookOpen,
  Key
} from 'lucide-react';
import { Deployment, User } from '../types/deployflow';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenDeployModal: () => void;
  onOpenSshModal?: () => void;
  currentUser?: User | null;
  onResetDemo: () => void;
  deployments: Deployment[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenDeployModal,
  onOpenSshModal,
  onResetDemo,
  deployments
}) => {
  const runningCount = deployments.filter((d) => d.status === 'RUNNING').length;

  const navItems = [
    {
      id: 'deployments',
      label: 'Deployments',
      icon: Rocket,
      badge: deployments.length,
      description: 'Manage applications & live links'
    },
    {
      id: 'containers',
      label: 'Docker Containers',
      icon: Server,
      badge: runningCount,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      description: 'Container process list'
    },
    {
      id: 'ec2-ssh',
      label: 'AWS EC2 SSH Key',
      icon: Key,
      description: 'SSH credentials & terminal'
    },
    {
      id: 'docker-workbench',
      label: 'Docker CLI Terminal',
      icon: Terminal,
      description: 'Docker shell & commands'
    },
    {
      id: 'monitoring',
      label: 'Live Telemetry',
      icon: Activity,
      description: 'CPU, RAM & Container Health'
    },
    {
      id: 'docs',
      label: 'Deployment Guide',
      icon: BookOpen,
      description: 'EC2 & Docker Hub guide'
    }
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col border-r border-zinc-800/80 bg-zinc-950 p-4 justify-between h-screen sticky top-0">
      <div className="space-y-6">
        {/* Brand Zone */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold shadow-inner">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-zinc-100 flex items-center gap-1.5">
                <span>DeployFlow</span>
              </div>
              <p className="text-[11px] font-mono text-zinc-500">AWS EC2 & Docker Hub</p>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <div>
          <button
            onClick={onOpenDeployModal}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-semibold text-xs tracking-wide rounded-xl shadow-md transition-all active:scale-95 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 fill-current group-hover:rotate-90 transition-transform duration-300" />
            <span className="whitespace-nowrap">Deploy on AWS EC2</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="space-y-1">
          <div className="px-2 pb-1.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium rounded-xl transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer ${
                  isActive
                    ? 'bg-zinc-800/90 text-emerald-400 shadow-sm border border-zinc-700/70 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-zinc-400'}`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Area: EC2 SSH Quick Link, Local DB Status & Reset */}
      <div className="space-y-2 pt-4 border-t border-zinc-800/80">
        {/* EC2 SSH Quick Link */}
        <button
          onClick={() => {
            if (onOpenSshModal) onOpenSshModal();
            else setActiveTab('ec2-ssh');
          }}
          className="w-full rounded-xl border border-zinc-800/90 bg-zinc-900/40 hover:bg-zinc-900 p-2.5 space-y-1 text-xs text-left transition-colors group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 font-medium flex items-center gap-1.5 group-hover:text-emerald-400 transition-colors">
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              <span>AWS EC2 SSH</span>
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Ready
            </span>
          </div>
          <div className="text-[10px] text-zinc-500 font-mono truncate">
            ec2-user@13.21.45.43:22
          </div>
        </button>

        {/* Docker Host Engine Ingress Status (Zero-DB Architecture) */}
        <div className="w-full rounded-xl border border-zinc-800/90 bg-zinc-900/40 p-2.5 space-y-1 text-xs text-left">
          <div className="flex items-center justify-between">
            <span className="text-zinc-300 font-medium flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>Host Ports: 8001-9000</span>
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Docker PS
            </span>
          </div>
          <div className="text-[10px] text-zinc-500 font-mono truncate">
            Dashboard: :8000 • Zero-DB
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={onResetDemo}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 text-[11px] text-zinc-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg border border-zinc-800/80 transition-colors cursor-pointer"
          title="Clear all testing data and reset to a clean empty account"
        >
          <RefreshCw className="w-3 h-3 text-zinc-400" />
          <span>Reset Account State</span>
        </button>
      </div>
    </aside>
  );
};


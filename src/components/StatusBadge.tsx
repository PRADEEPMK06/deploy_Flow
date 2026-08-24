import React from 'react';
import { DeploymentStatus } from '../types/deployflow';
import {
  CheckCircle2,
  Clock,
  RotateCw,
  Search,
  Hammer,
  Radio,
  Activity,
  AlertCircle,
  PauseCircle,
  Trash2
} from 'lucide-react';

interface StatusBadgeProps {
  status: DeploymentStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'RUNNING':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-400',
          icon: CheckCircle2,
          pulse: false,
          label: 'RUNNING'
        };
      case 'HEALTH_CHECK':
        return {
          bg: 'bg-teal-500/10 border-teal-500/30 text-teal-300',
          dot: 'bg-teal-400',
          icon: Activity,
          pulse: true,
          label: 'HEALTH CHECK'
        };
      case 'BUILDING':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
          dot: 'bg-amber-400',
          icon: Hammer,
          pulse: true,
          label: 'BUILDING'
        };
      case 'DEPLOYING':
        return {
          bg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
          dot: 'bg-indigo-400',
          icon: Radio,
          pulse: true,
          label: 'DEPLOYING'
        };
      case 'ANALYZING':
        return {
          bg: 'bg-sky-500/10 border-sky-500/30 text-sky-300',
          dot: 'bg-sky-400',
          icon: Search,
          pulse: true,
          label: 'ANALYZING'
        };
      case 'CLONING':
        return {
          bg: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
          dot: 'bg-blue-400',
          icon: RotateCw,
          pulse: true,
          label: 'CLONING'
        };
      case 'QUEUED':
        return {
          bg: 'bg-zinc-800 border-zinc-700 text-zinc-300',
          dot: 'bg-zinc-400',
          icon: Clock,
          pulse: true,
          label: 'QUEUED'
        };
      case 'STOPPED':
        return {
          bg: 'bg-zinc-900 border-zinc-700 text-zinc-400',
          dot: 'bg-zinc-500',
          icon: PauseCircle,
          pulse: false,
          label: 'STOPPED'
        };
      case 'STOPPING':
        return {
          bg: 'bg-orange-500/10 border-orange-500/30 text-orange-300',
          dot: 'bg-orange-400',
          icon: RotateCw,
          pulse: true,
          label: 'STOPPING'
        };
      case 'FAILED':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          dot: 'bg-rose-500',
          icon: AlertCircle,
          pulse: false,
          label: 'FAILED'
        };
      case 'DELETING':
        return {
          bg: 'bg-rose-950/40 border-rose-800 text-rose-300',
          dot: 'bg-rose-600',
          icon: Trash2,
          pulse: true,
          label: 'DELETING'
        };
      case 'DELETED':
        return {
          bg: 'bg-zinc-900 border-zinc-800 text-zinc-500',
          dot: 'bg-zinc-600',
          icon: Trash2,
          pulse: false,
          label: 'DELETED'
        };
      default:
        return {
          bg: 'bg-zinc-800 border-zinc-700 text-zinc-300',
          dot: 'bg-zinc-400',
          icon: Clock,
          pulse: false,
          label: status
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5 font-medium',
    md: 'text-xs px-2.5 py-1 gap-2 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2.5 font-semibold'
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-md border whitespace-nowrap shrink-0 tracking-wide select-none ${config.bg} ${sizeClasses}`}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        {config.pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dot}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`} />
      </span>

      {showIcon && <Icon className={`shrink-0 ${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />}
      <span className="truncate">{config.label}</span>
    </span>
  );
};

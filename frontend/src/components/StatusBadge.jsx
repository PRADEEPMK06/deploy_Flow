import React from 'react';
import { CheckCircle2, XCircle, Clock, AlertTriangle, RefreshCw, ShieldAlert } from 'lucide-react';

const StatusBadge = ({ status, size = 'sm' }) => {
  const getStatusConfig = (currentStatus) => {
    switch (currentStatus?.toLowerCase()) {
      case 'success':
      case 'healthy':
      case 'active':
      case 'running':
        return {
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-400',
          border: 'border-emerald-500/20',
          icon: CheckCircle2,
          label: currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)
        };
      case 'failed':
      case 'error':
      case 'unhealthy':
      case 'critical':
        return {
          bg: 'bg-rose-500/10',
          text: 'text-rose-400',
          border: 'border-rose-500/20',
          icon: XCircle,
          label: currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)
        };
      case 'pending':
      case 'queued':
        return {
          bg: 'bg-amber-500/10',
          text: 'text-amber-400',
          border: 'border-amber-500/20',
          icon: Clock,
          label: currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)
        };
      case 'building':
      case 'deploying':
      case 'in_progress':
        return {
          bg: 'bg-indigo-500/10',
          text: 'text-indigo-400',
          border: 'border-indigo-500/20',
          icon: RefreshCw,
          spinIcon: true,
          label: currentStatus.replace('_', ' ').charAt(0).toUpperCase() + currentStatus.replace('_', ' ').slice(1)
        };
      case 'rolled_back':
        return {
          bg: 'bg-purple-500/10',
          text: 'text-purple-400',
          border: 'border-purple-500/20',
          icon: ShieldAlert,
          label: 'Rolled Back'
        };
      default:
        return {
          bg: 'bg-slate-800',
          text: 'text-slate-400',
          border: 'border-slate-700',
          icon: AlertTriangle,
          label: currentStatus ? currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1) : 'Unknown'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const sizeClasses = size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs';
  const iconSize = size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5';

  return (
    <span className={`inline-flex items-center space-x-1.5 font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}>
      <Icon className={`${iconSize} ${config.spinIcon ? 'animate-spin' : ''}`} />
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
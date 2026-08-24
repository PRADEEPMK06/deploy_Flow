import React, { useState, useEffect, useRef } from 'react';
import { DeploymentLog, LogLevel } from '../types/deployflow';
import {
  Terminal,
  Search,
  Copy,
  Download,
  Check,
  ChevronDown,
  Filter,
  ArrowDown,
  RotateCcw
} from 'lucide-react';

interface LogsTerminalProps {
  logs: DeploymentLog[];
  deploymentId: string;
  isLive?: boolean;
}

export const LogsTerminal: React.FC<LogsTerminalProps> = ({ logs, deploymentId, isLive = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<'ALL' | LogLevel>('ALL');
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.step && log.step.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLevel = levelFilter === 'ALL' || log.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const handleCopyLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.level}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.level}] ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deployflow-${deploymentId}-logs.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLevelStyle = (level: LogLevel) => {
    switch (level) {
      case 'INFO':
        return 'text-emerald-400 font-semibold';
      case 'WARNING':
        return 'text-amber-400 font-semibold';
      case 'ERROR':
        return 'text-rose-400 font-semibold';
      case 'DEBUG':
        return 'text-zinc-500 font-mono';
      default:
        return 'text-zinc-400';
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
      {/* Terminal Top Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs">
        {/* Left: Window control dots + title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-300 font-mono text-[11px]">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>deployflow-worker@{deploymentId.slice(0, 12)}:~#</span>
          </div>
          {isLive && (
            <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Streaming
            </span>
          )}
        </div>

        {/* Right: Search, Filter, Actions */}
        <div className="flex items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search logs..."
              className="pl-8 pr-2.5 py-1 text-[11px] bg-zinc-950 border border-zinc-800 rounded text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 w-36 font-mono"
            />
          </div>

          {/* Level selector */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as any)}
            className="px-2 py-1 text-[11px] bg-zinc-950 border border-zinc-800 rounded text-zinc-300 focus:outline-none focus:border-emerald-500 font-mono"
          >
            <option value="ALL">All Levels</option>
            <option value="INFO">INFO only</option>
            <option value="DEBUG">DEBUG only</option>
            <option value="WARNING">WARN only</option>
            <option value="ERROR">ERROR only</option>
          </select>

          {/* Autoscroll toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2 py-1 text-[11px] rounded border font-mono flex items-center gap-1 transition-colors ${
              autoScroll
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Toggle autoscroll to bottom"
          >
            <ArrowDown className="w-3 h-3" />
            <span>Follow</span>
          </button>

          {/* Copy button */}
          <button
            onClick={handleCopyLogs}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded border border-zinc-800 transition-colors"
            title="Copy logs to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Download button */}
          <button
            onClick={handleDownloadLogs}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded border border-zinc-800 transition-colors"
            title="Download log file (.txt)"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1.5 select-text min-h-[320px] max-h-[500px]">
        {filteredLogs.length === 0 ? (
          <div className="text-zinc-500 py-12 text-center text-xs">
            {searchTerm ? `No log entries matching "${searchTerm}"` : 'Awaiting worker output stream...'}
          </div>
        ) : (
          filteredLogs.map((log, index) => {
            const timeStr = new Date(log.timestamp).toLocaleTimeString([], {
              hour12: false,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });

            return (
              <div key={log.id || index} className="flex items-start gap-2.5 leading-relaxed group hover:bg-zinc-900/50 py-0.5 px-1.5 rounded">
                <span className="text-zinc-600 select-none text-[11px] w-7 text-right shrink-0">
                  {index + 1}
                </span>
                <span className="text-zinc-500 select-none text-[11px] shrink-0">
                  {timeStr}
                </span>
                <span className={`text-[11px] select-none w-14 shrink-0 ${getLevelStyle(log.level)}`}>
                  [{log.level}]
                </span>
                {log.step && (
                  <span className="text-[10px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-1 rounded select-none shrink-0">
                    {log.step}
                  </span>
                )}
                <span className="text-zinc-200 break-all flex-1">
                  {log.message}
                </span>
              </div>
            );
          })
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { DOCKER_CLI_COMMANDS, DockerCliCommand } from '../data/dockerCommands';
import {
  Terminal,
  Play,
  Copy,
  Check,
  Server,
  Layers,
  Zap,
  HardDrive,
  Cpu
} from 'lucide-react';

export const DockerCliWorkbench: React.FC = () => {
  const [selectedCommand, setSelectedCommand] = useState<DockerCliCommand>(DOCKER_CLI_COMMANDS[0]);
  const [running, setRunning] = useState(false);
  const [cliOutput, setCliOutput] = useState<string | null>(DOCKER_CLI_COMMANDS[0].exampleOutput);
  const [copied, setCopied] = useState(false);
  const [customCommandInput, setCustomCommandInput] = useState(DOCKER_CLI_COMMANDS[0].command);

  const handleSelectCommand = (cmd: DockerCliCommand) => {
    setSelectedCommand(cmd);
    setCustomCommandInput(cmd.command);
    setCliOutput(cmd.exampleOutput);
  };

  const handleRunCommand = () => {
    setRunning(true);
    setCliOutput('Executing on Docker Desktop Engine (/var/run/docker.sock)...');
    setTimeout(() => {
      setCliOutput(selectedCommand.exampleOutput);
      setRunning(false);
    }, 450);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(customCommandInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Info */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">Docker Desktop CLI Workbench</h2>
              <p className="text-xs text-zinc-400">
                Interactive terminal for local container execution, port binding, and container inspection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Docker Desktop Engine Active
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Command Library Column */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
            Docker CLI Operations
          </h3>
          <div className="space-y-2">
            {DOCKER_CLI_COMMANDS.map((cmd, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectCommand(cmd)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                  selectedCommand.name === cmd.name
                    ? 'bg-zinc-900 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/20'
                    : 'bg-zinc-950/80 border-zinc-800/80 text-zinc-300 hover:bg-zinc-900/60 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-sans">{cmd.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800/90 text-zinc-400">
                    {cmd.category}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">{cmd.description}</p>
                <code className="text-[10px] text-emerald-400/90 font-mono block mt-2 truncate bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                  {cmd.command}
                </code>
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Shell Execution Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  Docker Shell Prompt
                </span>
              </div>
              <span className="text-[11px] text-zinc-500 font-mono">
                Host Socket: /var/run/docker.sock
              </span>
            </div>

            {/* Command Input Box */}
            <div className="relative">
              <input
                type="text"
                value={customCommandInput}
                onChange={(e) => setCustomCommandInput(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500 shadow-inner"
              />
              <div className="absolute right-2 top-2 flex items-center gap-1.5">
                <button
                  onClick={handleCopy}
                  className="p-1.5 text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                  title="Copy command"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleRunCommand}
                  disabled={running}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-semibold text-xs rounded-lg transition-all shadow active:scale-95 disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 fill-current ${running ? 'animate-spin' : ''}`} />
                  <span>{running ? 'Running...' : 'Execute'}</span>
                </button>
              </div>
            </div>

            {/* Command Explanation */}
            <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-xs text-zinc-300 space-y-1">
              <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Description</span>
              <p>{selectedCommand.description}</p>
            </div>

            {/* Terminal Output Window */}
            <div className="rounded-xl border border-zinc-800 bg-black overflow-hidden font-mono text-xs shadow-2xl">
              <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                  <span className="text-[11px] text-zinc-400 ml-2">stdout (docker-cli)</span>
                </div>
                <span className="text-[10px] text-zinc-500">Exit Code: 0</span>
              </div>
              <pre className="p-4 text-emerald-400 whitespace-pre-wrap leading-relaxed overflow-x-auto min-h-[220px]">
                {cliOutput || 'Waiting for execution...'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

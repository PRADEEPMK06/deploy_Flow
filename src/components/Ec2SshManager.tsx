import React, { useState, useEffect } from 'react';
import {
  Server,
  Terminal,
  Key,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Copy,
  Check,
  Upload,
  Cpu,
  HardDrive,
  Clock,
  Layers,
  ArrowRight,
  ExternalLink,
  Lock,
  ChevronRight
} from 'lucide-react';
import { deployEngine } from '../services/deployEngine';
import { Ec2SshConfig, SshExecResult } from '../types/deployflow';

interface Ec2SshManagerProps {
  onNotify?: (message: string) => void;
}

export const Ec2SshManager: React.FC<Ec2SshManagerProps> = ({ onNotify }) => {
  const [host, setHost] = useState('13.21.45.43');
  const [port, setPort] = useState<number>(22);
  const [username, setUsername] = useState('ec2-user');
  const [privateKey, setPrivateKey] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [hasStoredKey, setHasStoredKey] = useState(false);
  const [status, setStatus] = useState<'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'UNCONFIGURED'>('UNCONFIGURED');
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isInstallingDocker, setIsInstallingDocker] = useState(false);
  const [connectionDetails, setConnectionDetails] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Command Runner State
  const [terminalCommand, setTerminalCommand] = useState('docker ps -a');
  const [isExecutingCmd, setIsExecutingCmd] = useState(false);
  const [execResult, setExecResult] = useState<SshExecResult | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Load configuration on mount
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const config = await deployEngine.getEc2SshConfig();
      if (config) {
        if (config.host) setHost(config.host);
        if (config.port) setPort(config.port);
        if (config.username) setUsername(config.username);
        setHasStoredKey(!!config.has_private_key);
        if (config.status) setStatus(config.status);
        if (config.os_info || config.docker_version) {
          setConnectionDetails({
            osInfo: config.os_info,
            dockerVersion: config.docker_version,
            uptime: config.uptime,
            host: config.host,
            username: config.username
          });
        }
      }
    } catch (e) {}
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setPrivateKey(content);
        if (onNotify) onNotify(`Loaded SSH Key file: ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setErrorMessage(null);
    try {
      const res = await deployEngine.testEc2SshConnection({
        host,
        port,
        username,
        privateKey: privateKey || undefined,
        passphrase: passphrase || undefined
      });

      if (res.success) {
        setStatus('CONNECTED');
        setConnectionDetails(res.details);
        setHasStoredKey(true);
        if (onNotify) onNotify(`SSH Handshake Verified! Connected to ${username}@${host}`);
      } else {
        setStatus('ERROR');
        setErrorMessage(res.message || 'SSH connection failed.');
        if (onNotify) onNotify(`SSH Connection Failed: ${res.message}`);
      }
    } catch (err: any) {
      setStatus('ERROR');
      setErrorMessage(err.message || 'Connection error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const res = await deployEngine.saveEc2SshConfig({
        host,
        port,
        username,
        privateKey: privateKey || undefined,
        passphrase: passphrase || undefined
      });

      if (res.success) {
        setHasStoredKey(true);
        if (onNotify) onNotify('AWS EC2 SSH credentials securely saved.');
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInstallDocker = async () => {
    setIsInstallingDocker(true);
    try {
      const res = await deployEngine.installDockerOnEc2();
      if (res.success) {
        if (onNotify) onNotify('Docker service installed and started on AWS EC2 host!');
        handleTestConnection();
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsInstallingDocker(false);
    }
  };

  const handleExecuteCommand = async (cmdToRun?: string) => {
    const cmd = cmdToRun || terminalCommand;
    if (!cmd.trim()) return;

    setIsExecutingCmd(true);
    try {
      const res = await deployEngine.execEc2Command(cmd);
      setExecResult(res);
    } catch (err: any) {
      setExecResult({
        stdout: '',
        stderr: err.message,
        code: 1,
        duration_ms: 0,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsExecutingCmd(false);
    }
  };

  const quickPresets = [
    { label: 'ec2-user (Amazon Linux / AL2023)', val: 'ec2-user' },
    { label: 'ubuntu (Ubuntu Server)', val: 'ubuntu' },
    { label: 'root', val: 'root' },
    { label: 'admin (Debian)', val: 'admin' }
  ];

  const quickCommands = [
    { name: 'Docker Containers', cmd: 'docker ps -a --format "table {{.ID}}\\t{{.Names}}\\t{{.Image}}\\t{{.Ports}}\\t{{.Status}}"' },
    { name: 'Docker Version', cmd: 'docker --version && docker compose version || true' },
    { name: 'System Memory & CPU', cmd: 'free -h && uptime && uname -r' },
    { name: 'Disk Space', cmd: 'df -h /' },
    { name: 'Docker Service Status', cmd: 'systemctl status docker --no-pager | head -n 12' },
    { name: 'Listening TCP Ports', cmd: 'sudo ss -tulpn | grep LISTEN || netstat -tulpn' }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-100">AWS EC2 SSH Credential & Remote Execution Manager</h1>
              <p className="text-xs text-zinc-400">
                Configure your EC2 Host IP, SSH Username, and Private Key (.pem) to orchestrate live Docker deployments and execute remote commands
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold border ${
                status === 'CONNECTED'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : status === 'ERROR'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  status === 'CONNECTED' ? 'bg-emerald-400 animate-pulse' : status === 'ERROR' ? 'bg-rose-400' : 'bg-zinc-500'
                }`}
              />
              <span>
                {status === 'CONNECTED'
                  ? `SSH ACTIVE (${username}@${host})`
                  : status === 'ERROR'
                  ? 'SSH FAILED'
                  : 'NOT CONNECTED'}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: SSH Connection Settings (5 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <span>EC2 Connection Parameters</span>
              </h2>
              <span className="text-[11px] font-mono text-zinc-500">Port 22 SSH</span>
            </div>

            {/* Host & Port Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  EC2 Public IPv4 / Hostname <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="e.g. 13.21.45.43"
                  className="w-full px-3 py-2 text-xs font-mono bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Port</label>
                <input
                  type="number"
                  value={port}
                  onChange={(e) => setPort(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* SSH Username & Quick Presets */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">
                SSH Username <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ec2-user or ubuntu"
                className="w-full px-3 py-2 text-xs font-mono bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-emerald-500"
              />

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {quickPresets.map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => setUsername(preset.val)}
                    className={`px-2 py-0.5 text-[11px] font-mono rounded border transition-colors cursor-pointer ${
                      username === preset.val
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {preset.val}
                  </button>
                ))}
              </div>
            </div>

            {/* SSH Private Key Textarea / File Upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SSH Private Key (.pem / OpenSSH) <span className="text-emerald-400">*</span></span>
                </label>

                {/* File Upload Button */}
                <label className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 cursor-pointer font-mono">
                  <Upload className="w-3 h-3" />
                  <span>Upload .pem file</span>
                  <input
                    type="file"
                    accept=".pem,.key,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <textarea
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder={`-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA0... (paste your .pem content here)\n-----END RSA PRIVATE KEY-----`}
                rows={7}
                className="w-full p-3 text-[11px] font-mono bg-zinc-900 border border-zinc-800 rounded-lg text-emerald-300 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 leading-relaxed"
              />

              {hasStoredKey && !privateKey && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-mono flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Existing SSH Private Key is configured on backend. Paste new key to update.</span>
                </div>
              )}
            </div>

            {/* Passphrase (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400">
                Key Passphrase <span className="text-zinc-500">(Optional if encrypted)</span>
              </label>
              <input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Leave blank if standard unencrypted .pem key"
                className="w-full px-3 py-2 text-xs font-mono bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Error Display */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="break-all">{errorMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="flex-1 py-2.5 px-4 bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-bold text-xs rounded-lg shadow transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isTesting ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting to EC2...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 fill-current" />
                    <span>Test SSH Connection</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={isSaving}
                className="py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-semibold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Connection Diagnostics & 1-Click Docker Setup (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Host Diagnostics Card */}
          <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>Live Host Diagnostics</span>
              </h2>
              <button
                onClick={handleTestConnection}
                className="text-[11px] font-mono text-emerald-400 hover:underline flex items-center gap-1"
              >
                <RotateCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                <span>Refresh Diagnostics</span>
              </button>
            </div>

            {connectionDetails ? (
              <div className="space-y-3 font-mono text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Operating System</span>
                    <div className="font-semibold text-zinc-200 truncate">{connectionDetails.osInfo || 'Linux'}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Docker Engine</span>
                    <div className="font-semibold text-emerald-400 truncate">
                      {connectionDetails.dockerVersion || 'Ready for Docker'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">EC2 Host IP</span>
                    <div className="font-semibold text-zinc-200">{connectionDetails.host || host}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Host Uptime</span>
                    <div className="font-semibold text-zinc-200">{connectionDetails.uptime || 'online'}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
                <Server className="w-6 h-6 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">Provide credentials and click "Test SSH Connection" to inspect remote EC2 host.</p>
              </div>
            )}

            {/* 1-Click Install Docker Button */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-zinc-900 border border-emerald-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-emerald-300">1-Click Docker Setup on EC2</h3>
                  <p className="text-[11px] text-zinc-400">
                    Installs Docker daemon, enables service on boot, and grants non-root execution permissions over SSH.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleInstallDocker}
                disabled={isInstallingDocker || status !== 'CONNECTED'}
                className="w-full py-2 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                {isInstallingDocker ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing Docker installation script over SSH...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Run Docker Setup Script on EC2</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Remote Shell Workbench Card */}
          <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Remote EC2 Command Shell</span>
              </h2>
              <span className="text-[11px] font-mono text-zinc-500">Live SSH Exec</span>
            </div>

            {/* Quick Command Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-zinc-400">Quick Commands:</span>
              <div className="flex flex-wrap gap-1.5">
                {quickCommands.map((qc) => (
                  <button
                    key={qc.name}
                    type="button"
                    onClick={() => {
                      setTerminalCommand(qc.cmd);
                      handleExecuteCommand(qc.cmd);
                    }}
                    className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[11px] text-zinc-300 hover:text-emerald-300 font-mono transition-colors cursor-pointer"
                  >
                    {qc.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Command Input Row */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2 text-emerald-400 font-mono text-xs">$</span>
                <input
                  type="text"
                  value={terminalCommand}
                  onChange={(e) => setTerminalCommand(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleExecuteCommand()}
                  placeholder="docker ps -a"
                  className="w-full pl-7 pr-3 py-2 text-xs font-mono bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="button"
                onClick={() => handleExecuteCommand()}
                disabled={isExecutingCmd || status !== 'CONNECTED'}
                className="py-2 px-3.5 bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-bold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                {isExecutingCmd ? (
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
                <span>Run</span>
              </button>
            </div>

            {/* Command Output Terminal Window */}
            {execResult && (
              <div className="rounded-xl border border-zinc-800 bg-black/80 overflow-hidden font-mono text-xs">
                <div className="px-3 py-2 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        execResult.code === 0 ? 'bg-emerald-400' : 'bg-rose-400'
                      }`}
                    />
                    <span>Exit Code: {execResult.code}</span>
                    <span>•</span>
                    <span>{execResult.duration_ms}ms</span>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(execResult.stdout || execResult.stderr);
                      setCopiedKey(true);
                      setTimeout(() => setCopiedKey(false), 2000);
                    }}
                    className="text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
                  >
                    {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey ? 'Copied' : 'Copy Output'}</span>
                  </button>
                </div>

                <pre className="p-4 text-emerald-400 overflow-x-auto max-h-56 leading-relaxed whitespace-pre-wrap">
                  {execResult.stdout || execResult.stderr || '[Empty output]'}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { DeployModal } from './components/DeployModal';
import { DeploymentDetailModal } from './components/DeploymentDetailModal';
import { DockerContainerManager } from './components/DockerContainerManager';
import { DockerCliWorkbench } from './components/DockerCliWorkbench';
import { DocsGuideView } from './components/DocsGuideView';
import { MonitoringView } from './components/MonitoringView';
import { Ec2SshManager } from './components/Ec2SshManager';
import { Ec2SshModal } from './components/Ec2SshModal';
import { AuthScreen } from './components/AuthScreen';
import { UserAvatarMenu } from './components/UserAvatarMenu';
import { deployEngine } from './services/deployEngine';
import { Deployment, User } from './types/deployflow';
import { Zap, Menu, X, Rocket, Server, Activity, PlusCircle, Terminal, BookOpen, Key } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('deployments');
  const [deployments, setDeployments] = useState<Deployment[]>(deployEngine.getDeployments());
  const [currentUser, setCurrentUser] = useState<User | null>(deployEngine.getCurrentUser());
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isSshModalOpen, setIsSshModalOpen] = useState(false);
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = deployEngine.subscribe(() => {
      setDeployments([...deployEngine.getDeployments()]);
      setCurrentUser(deployEngine.getCurrentUser());
      if (selectedDeployment) {
        const updated = deployEngine.getDeploymentById(selectedDeployment.id);
        if (updated) setSelectedDeployment(updated);
      }
    });
    return unsubscribe;
  }, [selectedDeployment]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleAuthSuccess = (user: User, message: string) => {
    setCurrentUser(user);
    setDeployments([...deployEngine.getDeployments()]);
    showToast(message);
  };

  const handleSignOut = () => {
    deployEngine.logout();
    setCurrentUser(null);
    setDeployments([]);
    showToast('Signed out. Please sign in to access the dashboard.');
  };

  const handleDeploy = async (params: any) => {
    try {
      const created = await deployEngine.createDeployment(params);
      setSelectedDeployment(created);
      showToast(`Deployment initiated for ${created.project_name}! Pipeline started.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to start deployment');
    }
  };

  const handleRestart = (id: string) => {
    deployEngine.restartDeployment(id);
    showToast('Container restart signal sent.');
  };

  const handleStop = (id: string) => {
    deployEngine.stopDeployment(id);
    showToast('Container stopped.');
  };

  const handleDelete = (id: string) => {
    deployEngine.deleteDeployment(id);
    if (selectedDeployment?.id === id) {
      setSelectedDeployment(null);
    }
    showToast('Deployment and container deleted.');
  };

  const handleResetDemo = async () => {
    await deployEngine.resetToDefault();
    setCurrentUser(null);
    setSelectedDeployment(null);
    setDeployments([]);
    showToast('Environment reset: All test data cleared. Account is clean and empty.');
  };

  const currentSelectedLogs = selectedDeployment
    ? deployEngine.getLogsForDeployment(selectedDeployment.id)
    : [];

  // Authentication Gate: Show Login / Register Screen if not signed in
  if (!currentUser) {
    return (
      <>
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-lg bg-zinc-900 border border-emerald-500/40 text-emerald-300 text-xs font-medium shadow-2xl animate-in slide-in-from-bottom-2 duration-150 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-zinc-950 border-b border-zinc-800 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <span className="font-bold text-sm text-zinc-100">DeployFlow</span>
        </div>

        <div className="flex items-center gap-2">
          <UserAvatarMenu
            currentUser={currentUser}
            onUserUpdated={handleAuthSuccess}
            onSignOut={handleSignOut}
          />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-400 hover:text-zinc-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

        {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80 p-4 pt-16 animate-in fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div className="space-y-2">
              <button
                onClick={() => {
                  setActiveTab('deployments');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium ${
                  activeTab === 'deployments' ? 'bg-zinc-800 text-emerald-400 font-semibold' : 'text-zinc-400'
                }`}
              >
                <Rocket className="w-4 h-4" />
                <span>Deployments</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('containers');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium ${
                  activeTab === 'containers' ? 'bg-zinc-800 text-emerald-400 font-semibold' : 'text-zinc-400'
                }`}
              >
                <Server className="w-4 h-4" />
                <span>Docker Containers</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('ec2-ssh');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium ${
                  activeTab === 'ec2-ssh' ? 'bg-zinc-800 text-emerald-400 font-semibold' : 'text-zinc-400'
                }`}
              >
                <Key className="w-4 h-4" />
                <span>AWS EC2 SSH Key</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('docker-workbench');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium ${
                  activeTab === 'docker-workbench' ? 'bg-zinc-800 text-emerald-400 font-semibold' : 'text-zinc-400'
                }`}
              >
                <Terminal className="w-4 h-4" />
                <span>Docker CLI</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('monitoring');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium ${
                  activeTab === 'monitoring' ? 'bg-zinc-800 text-emerald-400 font-semibold' : 'text-zinc-400'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Monitor</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('docs');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium ${
                  activeTab === 'docs' ? 'bg-zinc-800 text-emerald-400 font-semibold' : 'text-zinc-400'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Deployment Guide</span>
              </button>
            </div>

            <button
              onClick={() => {
                setIsDeployModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 bg-emerald-400 text-zinc-950 font-semibold rounded-lg text-xs"
            >
              + New Deployment
            </button>
          </div>
        </div>
      )}

      {/* Main Persistent Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDeployModal={() => setIsDeployModalOpen(true)}
        onOpenSshModal={() => setIsSshModalOpen(true)}
        currentUser={currentUser}
        onResetDemo={handleResetDemo}
        deployments={deployments}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar for Desktop */}
        <div className="hidden md:flex items-center justify-between px-6 lg:px-8 py-3.5 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            {activeTab === 'deployments' && 'Applications & Deployments (AWS EC2 & Docker Hub)'}
            {activeTab === 'containers' && 'Docker Container Manager'}
            {activeTab === 'ec2-ssh' && 'AWS EC2 SSH Credential & Terminal Workbench'}
            {activeTab === 'docker-workbench' && 'Docker CLI Shell & Operations'}
            {activeTab === 'monitoring' && 'Live Container Telemetry & Monitor'}
            {activeTab === 'docs' && 'AWS EC2 & Docker Hub Deployment Guide'}
          </div>

          <div className="flex items-center gap-3">
            {/* EC2 SSH Key Button */}
            <button
              onClick={() => setIsSshModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-zinc-100 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-lg transition-colors cursor-pointer"
              title="AWS EC2 SSH Key & Remote Terminal"
            >
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              <span>EC2 SSH Key</span>
            </button>

            <button
              onClick={() => setIsDeployModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 fill-current" />
              <span>New Deploy</span>
            </button>

            {/* Top Right User Profile Avatar Menu */}
            <UserAvatarMenu
              currentUser={currentUser}
              onUserUpdated={handleAuthSuccess}
              onSignOut={handleSignOut}
            />
          </div>
        </div>

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full md:pt-6 pt-18">
          {/* Tab: Deployments */}
          {activeTab === 'deployments' && (
            <DashboardView
              deployments={deployments}
              onOpenDeployModal={() => setIsDeployModalOpen(true)}
              onSelectDeployment={(dep) => setSelectedDeployment(dep)}
              onRestart={handleRestart}
              onStop={handleStop}
              onDelete={handleDelete}
            />
          )}

          {/* Tab: Docker Containers */}
          {activeTab === 'containers' && (
            <DockerContainerManager
              deployments={deployments}
              onSelectDeployment={(dep) => setSelectedDeployment(dep)}
              onRestart={handleRestart}
              onStop={handleStop}
              onDelete={handleDelete}
            />
          )}

          {/* Tab: AWS EC2 SSH Credential Manager */}
          {activeTab === 'ec2-ssh' && (
            <Ec2SshManager onNotify={showToast} />
          )}

          {/* Tab: Docker CLI Workbench */}
          {activeTab === 'docker-workbench' && (
            <DockerCliWorkbench />
          )}

          {/* Tab: Docs & Guide */}
          {activeTab === 'docs' && (
            <DocsGuideView />
          )}

          {/* Tab: Monitor */}
          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-zinc-100">Live Resource Monitor</h2>
                  <p className="text-xs text-zinc-400">
                    Real-time CPU, RAM, and Network I/O metrics streaming from your active Docker containers
                  </p>
                </div>
              </div>

              {deployments.filter((d) => d.status === 'RUNNING').length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                  <p className="text-zinc-400 text-sm">No running containers to monitor.</p>
                  <button
                    onClick={() => setIsDeployModalOpen(true)}
                    className="px-4 py-2 text-xs font-semibold bg-emerald-400 text-zinc-950 rounded-lg shadow-sm cursor-pointer"
                  >
                    Deploy Application
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {deployments
                    .filter((d) => d.status === 'RUNNING')
                    .map((dep) => (
                      <div key={dep.id} className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4 shadow-lg">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                          <span className="font-bold text-sm text-zinc-200">{dep.project_name}</span>
                          <span className="text-xs font-mono text-emerald-400">Port {dep.host_port}</span>
                        </div>
                        <MonitoringView
                          deployment={dep}
                          onRestart={() => handleRestart(dep.id)}
                          onStop={() => handleStop(dep.id)}
                        />
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Deploy Wizard Modal */}
      <DeployModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        onDeploy={handleDeploy}
      />

      {/* AWS EC2 SSH Credentials & Terminal Modal */}
      <Ec2SshModal
        isOpen={isSshModalOpen}
        onClose={() => setIsSshModalOpen(false)}
        onNotify={showToast}
      />

      {/* Deployment Details / Logs / Live Preview Modal */}
      {selectedDeployment && (
        <DeploymentDetailModal
          deployment={selectedDeployment}
          logs={currentSelectedLogs}
          onClose={() => setSelectedDeployment(null)}
          onRestart={handleRestart}
          onStop={handleStop}
          onDelete={handleDelete}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-lg bg-zinc-900 border border-emerald-500/40 text-emerald-300 text-xs font-medium shadow-2xl animate-in slide-in-from-bottom-2 duration-150 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

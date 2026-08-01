import React, { useState } from 'react';
import { Settings as SettingsIcon, Key, Bell, Shield, Save } from 'lucide-react';

export default function Settings() {
  const [appName, setAppName] = useState('DeployFlow Production Cluster');
  const [webhookUrl, setWebhookUrl] = useState('https://api.deployflow.io/v1/webhook/trigger');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Platform Settings</h1>
        <p className="text-sm text-slate-400">Configure global platform preferences, security keys, and deployment webhooks.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
            <SettingsIcon className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">General Configuration</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Cluster Name</label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Global Webhook URL</label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Security & Tokens */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
            <Key className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">API Access & Authentication</h2>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Active Personal Access Token</label>
            <div className="flex items-center space-x-3">
              <input
                type="password"
                readOnly
                value="df_live_998374829102837465"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-400 font-mono text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => alert('Token regenerated!')}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
              >
                Regenerate
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-2">
          {saved && (
            <span className="text-sm font-medium text-emerald-400 animate-fade-in">
              Settings saved successfully!
            </span>
          )}
          <button
            type="submit"
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors shadow-lg shadow-indigo-600/20"
          >
            <Save className="h-4 w-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
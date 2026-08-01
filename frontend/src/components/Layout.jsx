import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Globe, Settings, Layers, Cpu, LogOut } from 'lucide-react';

const FullLayout = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Live Deploy', path: '/deploy-live', icon: Globe },
    { name: 'Infrastructure', path: '/infrastructure', icon: Layers },
    { name: 'Settings', path: '/settings', icon: Settings }
  ];

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-gray-800 flex items-center space-x-3">
          <Cpu className="h-7 w-7 text-blue-500 animate-pulse" />
          <span className="text-xl font-bold tracking-wider text-white">DeployFlow</span>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium shadow-lg shadow-blue-600/20'
                    : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / Version Info */}
        <div className="p-4 border-t border-gray-800/60 text-xs text-gray-500 text-center flex items-center justify-between">
          <span>Engine v1.0</span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-gray-900/50 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-8 z-10">
          <h2 className="text-lg font-semibold text-gray-200 tracking-wide">
            {navItems.find((item) => item.path === location.pathname)?.name || 'Control Panel'}
          </h2>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-medium text-emerald-400">System Online</span>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-950 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default FullLayout;
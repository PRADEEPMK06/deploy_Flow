import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import Repositories from './pages/Repositories';
import Deployments from './pages/Deployments';
import Metrics from './pages/Metrics';
import Logs from './pages/Logs';
import Settings from './pages/Settings';
import DeployLive from './pages/DeployLive'; // Import the new page
import DeploymentDetails from './pages/DeploymentDetails';

function AppRoutes() {
  const location = useLocation();

  return (
    <Layout>
      <ErrorBoundary key={location.pathname}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/repositories" element={<Repositories />} />
          <Route path="/deployments" element={<Deployments />} />
          <Route path="/deployments/:id" element={<DeploymentDetails />} />
          <Route path="/metrics" element={<Metrics />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/deploy-live" element={<DeployLive />} />
          <Route
            path="*"
            element={
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
                The requested page could not be found.
              </div>
            }
          />
        </Routes>
      </ErrorBoundary>
    </Layout>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
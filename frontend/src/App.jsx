import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Repositories from './pages/Repositories';
import Deployments from './pages/Deployments';
import Metrics from './pages/Metrics';
import Logs from './pages/Logs';
import Settings from './pages/Settings';
import DeployLive from './pages/DeployLive'; // Import the new page

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/repositories" element={<Repositories />} />
          <Route path="/deployments" element={<Deployments />} />
          <Route path="/metrics" element={<Metrics />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/deploy-live" element={<DeployLive />} />
        </Routes>
      </Layout>
    </Router>
  );
}
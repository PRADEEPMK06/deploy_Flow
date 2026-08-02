import axios from 'axios';

const API = axios.create({
  baseURL: '/api', // Proxied via vite.config.js to http://localhost:8000
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchHealth = async () => {
  const response = await API.get('/health');
  return response.data;
};

export const fetchRepositories = async () => {
  const response = await API.get('/repositories');
  return response.data;
};

export const addRepository = async (repoData) => {
  const response = await API.post('/repositories', repoData);
  return response.data;
};

export const fetchDeployments = async () => {
  const response = await API.get('/deployments');
  return response.data;
};

export const triggerDeployment = async (repoName) => {
  try {
    const response = await API.post('/deployments', null, {
      params: { repo_name: repoName }
    });
    return response?.data || null;
  } catch (error) {
    console.error('Trigger deployment API error:', error);
    return null;
  }
};

export const fetchMetrics = async () => {
  const response = await API.get('/metrics');
  return response.data;
};
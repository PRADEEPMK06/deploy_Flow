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
  const data = response.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.repositories)) return data.repositories;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

export const addRepository = async (repoData) => {
  const response = await API.post('/repositories', repoData);
  return response.data;
};

export const fetchDeployments = async () => {
  const response = await API.get('/deployments');
  const data = response.data;
  
  // Safely extract array regardless of how the backend wraps it
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.deployments)) return data.deployments;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  
  return [];
};

export const triggerDeployment = async (repoName) => {
  try {
    const response = await API.post('/deployments', null, {
      params: { repo_name: repoName }
    });
    const data = response.data;
    // Extract single deployment object if wrapped
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return data.deployment || data.data || data;
    }
    return data;
  } catch (error) {
    console.error('Trigger deployment API error:', error);
    return null;
  }
};

export const fetchMetrics = async () => {
  const response = await API.get('/metrics');
  return response.data;
};
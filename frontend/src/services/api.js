import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api'; // Adjust to your backend URL if different

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchDeployments = async () => {
  try {
    const response = await apiClient.get('/deployments');
    // Ensure we always return the raw data payload, whether it's an array or object
    return response.data;
  } catch (error) {
    console.error('API Error fetching deployments:', error);
    return [];
  }
};

export const triggerDeployment = async (repoName) => {
  try {
    const response = await apiClient.post('/deployments/trigger', { repo: repoName });
    return response.data;
  } catch (error) {
    console.error('API Error triggering deployment:', error);
    throw error;
  }
};
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const fallbackArray = [];
const fallbackObject = {};

const unwrapPayload = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== 'object') {
    return payload;
  }

  const candidateKeys = ['data', 'items', 'deployments', 'repositories', 'metrics', 'overview', 'result', 'results'];
  for (const key of candidateKeys) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      return payload[key];
    }
  }

  return payload;
};

const toSafeArray = (payload) => {
  const normalized = unwrapPayload(payload);
  return Array.isArray(normalized) ? normalized : fallbackArray;
};

const toSafeObject = (payload) => {
  const normalized = unwrapPayload(payload);
  return normalized && typeof normalized === 'object' && !Array.isArray(normalized) ? normalized : fallbackObject;
};

const resolveRepositoryId = async (repoIdentifier) => {
  if (typeof repoIdentifier === 'number' && Number.isFinite(repoIdentifier)) {
    return repoIdentifier;
  }

  if (!repoIdentifier) {
    return null;
  }

  const repositories = await fetchRepositories();
  const match = repositories.find(
    (repository) => repository?.name === repoIdentifier || repository?.repo_url === repoIdentifier,
  );

  return match?.id ?? null;
};

export const fetchDeployments = async () => {
  try {
    const response = await apiClient.get('/deployments');
    return toSafeArray(response.data);
  } catch (error) {
    console.error('API Error fetching deployments:', error);
    return [];
  }
};

export const fetchRepositories = async () => {
  try {
    const response = await apiClient.get('/repositories');
    return toSafeArray(response.data);
  } catch (error) {
    console.error('API Error fetching repositories:', error);
    return [];
  }
};

export const fetchDashboardOverview = async () => {
  try {
    const response = await apiClient.get('/dashboard/overview');
    return toSafeObject(response.data);
  } catch (error) {
    console.error('API Error fetching dashboard overview:', error);
    return {};
  }
};

export const fetchMetrics = async () => {
  const overview = await fetchDashboardOverview();

  return {
    cpu_utilization: overview.cpu_utilization || '0%',
    memory_usage: overview.memory_usage || '0%',
    network_in: overview.network_in || '0 KB',
    network_out: overview.network_out || '0 KB',
    health_score: overview.health_score || '100%',
    total_repositories: overview.total_repositories || 0,
    total_deployments: overview.total_deployments || 0,
    active_deployments: overview.active_deployments || 0,
    failed_deployments: overview.failed_deployments || 0,
    recent_deployments: Array.isArray(overview.recent_deployments) ? overview.recent_deployments : [],
    active_repositories: Array.isArray(overview.active_repositories) ? overview.active_repositories : [],
  };
};

export const triggerDeployment = async (repoName) => {
  try {
    const repositoryId = await resolveRepositoryId(repoName);
    if (!repositoryId) {
      return null;
    }

    const response = await apiClient.post('/deployments', { repository_id: repositoryId });
    return toSafeObject(response.data);
  } catch (error) {
    console.error('API Error triggering deployment:', error);
    return null;
  }
};
export type DeploymentStatus =
  | 'QUEUED'
  | 'CLONING'
  | 'ANALYZING'
  | 'BUILDING'
  | 'PUSHING_DOCKER_HUB'
  | 'EC2_DEPLOYING'
  | 'DEPLOYING'
  | 'HEALTH_CHECK'
  | 'RUNNING'
  | 'FAILED'
  | 'STOPPING'
  | 'STOPPED'
  | 'DELETING'
  | 'DELETED';

export type SourceType = 'GITHUB' | 'ZIP';
export type TargetEnvironment = 'AWS_EC2' | 'LOCAL_DOCKER';

export type LogLevel = 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG';

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  password?: string;
  is_active: boolean;
  created_at: string;
  token?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  user_id: string;
  created_at: string;
  deployments_count?: number;
}

export interface DetectedApp {
  language: string;
  framework: string;
  build_type: 'DOCKERFILE' | 'PYTHON_FASTAPI' | 'PYTHON_FLASK' | 'NODE_EXPRESS' | 'STATIC_WEB' | 'UNKNOWN';
  port: number;
  dockerfile_present: boolean;
  detected_files: string[];
}

export interface AppPreviewData {
  title: string;
  badge: string;
  description: string;
  sampleEndpointResponse: Record<string, any>;
  themeColor?: string;
}

export interface Deployment {
  id: string;
  project_id: string;
  project_name: string;
  user_id: string;
  source_type: SourceType;
  target_env?: TargetEnvironment;
  ec2_host_ip?: string;
  docker_hub_repo?: string;
  docker_hub_tag?: string;
  github_url?: string;
  github_branch?: string;
  zip_filename?: string;
  status: DeploymentStatus;
  container_id?: string;
  container_name?: string;
  host_port: number;
  internal_port: number;
  public_url: string;
  env_vars: Record<string, string>;
  cpu_limit: number;
  memory_limit_mb: number;
  detected_app?: DetectedApp;
  dockerfile_content?: string;
  docker_build_command?: string;
  docker_push_command?: string;
  docker_pull_command?: string;
  docker_run_command?: string;
  created_at: string;
  updated_at: string;
  error_message?: string;
  build_duration_sec?: number;
  health_status: 'HEALTHY' | 'UNHEALTHY' | 'PENDING' | 'STOPPED';
  health_last_check?: string;
  health_latency_ms?: number;
  app_preview_data?: AppPreviewData;
}

export interface DeploymentLog {
  id: string;
  deployment_id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  step?: string;
}

export interface DeploymentMetric {
  cpu_percent: number;
  memory_used_mb: number;
  memory_limit_mb: number;
  net_in_kb: number;
  net_out_kb: number;
  latency_ms: number;
  http_status: number;
  timestamp: string;
}

export interface Ec2SshConfig {
  host: string;
  port: number;
  username: string; // e.g. 'ec2-user', 'ubuntu', 'root'
  private_key?: string;
  passphrase?: string;
  has_private_key?: boolean;
  status?: 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'UNCONFIGURED';
  last_tested_at?: string;
  os_info?: string;
  docker_version?: string;
  uptime?: string;
  error_message?: string;
}

export interface SshExecResult {
  stdout: string;
  stderr: string;
  code: number;
  duration_ms: number;
  timestamp: string;
}


import logging
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from backend.utils.k8s_helper import K8sHelper
from backend.utils.aws_helper import AwsHelper

logger = logging.getLogger(__name__)


class MonitoringEngine:
    """Engine responsible for gathering runtime health metrics, logs, and monitoring application deployments."""

    @staticmethod
    def get_cluster_metrics() -> Dict[str, Any]:
        """Collects resource utilization metrics (CPU, Memory, Pod status) from the active cluster."""
        try:
            cluster_status = K8sHelper.get_cluster_health()
            return {
                "status": "healthy",
                "metrics": cluster_status
            }
        except Exception as e:
            logger.error(f"Failed to fetch cluster metrics: {e}")
            return {
                "status": "unhealthy",
                "error": str(e)
            }

    @staticmethod
    def get_deployment_logs(deployment_name: str, tail_lines: int = 100) -> List[str]:
        """Retrieves container logs for a specific deployment/pod."""
        try:
            logs = K8sHelper.get_pod_logs(deployment_name=deployment_name, tail_lines=tail_lines)
            return logs
        except Exception as e:
            logger.error(f"Failed to fetch logs for deployment {deployment_name}: {e}")
            return [f"Error retrieving logs: {str(e)}"]

    @staticmethod
    def check_service_health(service_url: str) -> Dict[str, Any]:
        """Performs an HTTP health check against a live deployment endpoint."""
        import requests
        try:
            response = requests.get(service_url, timeout=5)
            return {
                "is_up": response.status_code == 200,
                "status_code": response.status_code,
                "response_time_ms": response.elapsed.total_seconds() * 1000
            }
        except requests.RequestException as e:
            return {
                "is_up": False,
                "error": str(e)
            }
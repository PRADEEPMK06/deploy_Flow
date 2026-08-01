import logging
import subprocess
import json
from typing import Tuple, Dict, Any, List

logger = logging.getLogger(__name__)


class K8sHelper:
    """Utility helper for interacting with Kubernetes clusters using kubectl for deployments, health checks, and rollbacks."""

    @staticmethod
    def deploy_image(deployment_name: str, image_tag: str, replicas: int = 1, namespace: str = "default") -> Tuple[bool, str]:
        """Deploys or updates a Kubernetes deployment with a new container image."""
        try:
            logger.info(f"Deploying image '{image_tag}' to Kubernetes deployment '{deployment_name}' in namespace '{namespace}'")

            # Check if deployment already exists
            check_cmd = ["kubectl", "get", "deployment", deployment_name, "-n", namespace]
            check_result = subprocess.run(check_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=False)

            if check_result.returncode == 0:
                # Deployment exists, update the image
                patch_cmd = [
                    "kubectl", "set", "image", f"deployment/{deployment_name}",
                    f"{deployment_name}={image_tag}",
                    "-n", namespace
                ]
                result = subprocess.run(patch_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=False)
            else:
                # Create a basic deployment if it doesn't exist
                create_cmd = [
                    "kubectl", "create", "deployment", deployment_name,
                    "--image", image_tag,
                    "--replicas", str(replicas),
                    "-n", namespace
                ]
                result = subprocess.run(create_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=False)

            if result.returncode != 0:
                error_output = result.stderr.strip() or result.stdout.strip()
                logger.error(f"Kubernetes deployment failed for {deployment_name}: {error_output}")
                return False, f"Kubernetes deployment failed: {error_output}"

            logger.info(f"Successfully deployed {image_tag} to {deployment_name}")
            return True, "Kubernetes deployment executed successfully."

        except FileNotFoundError:
            error_msg = "kubectl CLI is not installed or not available in the system PATH."
            logger.error(error_msg)
            return False, error_msg
        except Exception as e:
            error_msg = f"Unexpected error during Kubernetes deployment: {str(e)}"
            logger.error(error_msg)
            return False, error_msg

    @staticmethod
    def rollback_deployment(deployment_name: str, image_tag: str, namespace: str = "default") -> Tuple[bool, str]:
        """Rolls back a Kubernetes deployment to a specific previous image tag or revision."""
        try:
            logger.info(f"Rolling back Kubernetes deployment '{deployment_name}' to image '{image_tag}' in namespace '{namespace}'")

            patch_cmd = [
                "kubectl", "set", "image", f"deployment/{deployment_name}",
                f"{deployment_name}={image_tag}",
                "-n", namespace
            ]

            result = subprocess.run(patch_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=False)

            if result.returncode != 0:
                # Fallback to native kubectl rollout undo if explicit image setting fails
                undo_cmd = ["kubectl", "rollout", "undo", f"deployment/{deployment_name}", "-n", namespace]
                result = subprocess.run(undo_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=False)

            if result.returncode != 0:
                error_output = result.stderr.strip() or result.stdout.strip()
                logger.error(f"Kubernetes rollback failed for {deployment_name}: {error_output}")
                return False, f"Kubernetes rollback failed: {error_output}"

            logger.info(f"Successfully rolled back deployment {deployment_name}")
            return True, "Kubernetes deployment rolled back successfully."

        except Exception as e:
            error_msg = f"Unexpected error during Kubernetes rollback: {str(e)}"
            logger.error(error_msg)
            return False, error_msg

    @staticmethod
    def get_cluster_health(namespace: str = "default") -> Dict[str, Any]:
        """Fetches resource statuses and pod health metrics from the Kubernetes cluster."""
        try:
            cmd = ["kubectl", "get", "pods", "-n", namespace, "-o", "json"]
            result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=False)

            if result.returncode != 0:
                raise Exception(result.stderr.strip() or "Failed to fetch cluster pods.")

            pods_data = json.loads(result.stdout)
            total_pods = len(pods_data.get("items", []))
            running_pods = 0

            for pod in pods_data.get("items", []):
                status = pod.get("status", {}).get("phase")
                if status == "Running":
                    running_pods += 1

            return {
                "total_pods": total_pods,
                "running_pods": running_pods,
                "namespace": namespace
            }
        except Exception as e:
            logger.error(f"Failed to get cluster health: {str(e)}")
            raise e

    @staticmethod
    def get_pod_logs(deployment_name: str, tail_lines: int = 100, namespace: str = "default") -> List[str]:
        """Retrieves container logs for pods matching a deployment label or name."""
        try:
            # Fetch pod name belonging to the deployment
            get_pod_cmd = [
                "kubectl", "get", "pods",
                "-l", f"app={deployment_name}",
                "-n", namespace,
                "-o", "jsonpath={.items[0].metadata.name}"
            ]
            pod_result = subprocess.run(get_pod_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=False)
            
            pod_name = pod_result.stdout.strip()
            if not pod_name or pod_result.returncode != 0:
                # Fallback attempt using direct deployment logs target if label selector varies
                pod_name = f"deployment/{deployment_name}"

            logs_cmd = [
                "kubectl", "logs", pod_name,
                "-n", namespace,
                "--tail", str(tail_lines)
            ]
            logs_result = subprocess.run(logs_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=False)

            if logs_result.returncode != 0:
                return [f"Error fetching logs: {logs_result.stderr.strip()}"]

            return logs_result.stdout.splitlines()

        except Exception as e:
            logger.error(f"Unexpected error while fetching pod logs: {str(e)}")
            return [f"Exception retrieving logs: {str(e)}"]
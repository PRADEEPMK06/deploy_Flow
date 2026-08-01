import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from backend.engines.build_engine import BuildEngine
from backend.utils.k8s_helper import K8sHelper
from backend.utils.aws_helper import AwsHelper
from backend.models.deployment import DeploymentStatus

logger = logging.getLogger(__name__)


class DeploymentEngine:
    """Engine responsible for orchestrating the deployment lifecycle (build, push, and deploy to target environment)."""

    @staticmethod
    def execute_deployment(
        db: Session,
        deployment_id: int,
        repo_url: str,
        branch: str,
        project_type: str,
        target_environment: str = "kubernetes"
    ) -> Dict[str, Any]:
        """Executes the full deployment workflow including build and deployment orchestration."""
        logger.info(f"Starting deployment pipeline #{deployment_id} for repository {repo_url} on branch {branch}")

        # Step 1: Run Build Pipeline (Clone & Build Artifacts/Docker Images)
        build_result = BuildEngine.run_build_pipeline(
            db=db,
            deployment_id=deployment_id,
            repo_url=repo_url,
            branch=branch,
            project_type=project_type
        )

        if build_result.get("status") == DeploymentStatus.FAILED:
            logger.error(f"Deployment #{deployment_id} failed during build stage: {build_result.get('error')}")
            return {
                "status": DeploymentStatus.FAILED,
                "step": "build",
                "message": build_result.get("error", "Build step failed.")
            }

        workspace = build_result.get("workspace")
        logger.info(f"Build completed successfully for deployment #{deployment_id}. Workspace: {workspace}")

        # Step 2: Target Environment Deployment (e.g., Kubernetes or AWS)
        if target_environment.lower() == "kubernetes":
            # Example Kubernetes deployment orchestration
            image_tag = f"deployflow_app_{deployment_id}:latest"
            deployment_name = f"deployflow-app-{deployment_id}"
            
            k8s_success, k8s_msg = K8sHelper.deploy_image(
                deployment_name=deployment_name,
                image_tag=image_tag,
                replicas=1
            )
            if not k8s_success:
                return {
                    "status": DeploymentStatus.FAILED,
                    "step": "kubernetes_deploy",
                    "message": k8s_msg
                }

        elif target_environment.lower() == "aws":
            # Example AWS deployment orchestration (e.g., ECS / Lambda / EC2)
            aws_success, aws_msg = AwsHelper.deploy_to_aws(workspace=workspace)
            if not aws_success:
                return {
                    "status": DeploymentStatus.FAILED,
                    "step": "aws_deploy",
                    "message": aws_msg
                }

        logger.info(f"Deployment pipeline #{deployment_id} completed successfully.")
        return {
            "status": DeploymentStatus.SUCCESS,
            "step": "completed",
            "message": "Deployment executed successfully."
        }
import os
import subprocess
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from backend.utils.docker_helper import DockerHelper
from backend.utils.git_helper import GitHelper
from backend.models.deployment import DeploymentStatus


class BuildEngine:
    """Engine responsible for building application artifacts, Docker images, and managing CI builds."""

    @staticmethod
    def clone_and_prepare_repo(repo_url: str, branch: str, target_dir: str) -> bool:
        """Clones a git repository to a target directory for building."""
        return GitHelper.clone_repository(repo_url, branch, target_dir)

    @staticmethod
    def build_docker_image(image_tag: str, dockerfile_path: str, build_context: str) -> Dict[str, Any]:
        """Builds a Docker image using the DockerHelper utility."""
        success, message = DockerHelper.build_image(
            image_tag=image_tag,
            dockerfile_path=dockerfile_path,
            build_context=build_context
        )
        return {
            "success": success,
            "message": message,
            "image_tag": image_tag if success else None
        }

    @staticmethod
    def run_build_pipeline(db: Session, deployment_id: int, repo_url: str, branch: str, project_type: str) -> Dict[str, Any]:
        """Orchestrates the end-to-end build pipeline for a deployment."""
        build_workspace = f"/tmp/deployflow_builds/{deployment_id}"
        
        # Step 1: Clone repository
        clone_success = BuildEngine.clone_and_prepare_repo(repo_url, branch, build_workspace)
        if not clone_success:
            return {
                "status": DeploymentStatus.FAILED,
                "error": "Failed to clone repository during build stage."
            }

        # Step 2: Handle specific project build workflows (e.g., Docker)
        if project_type.lower() == "docker":
            image_tag = f"deployflow_app_{deployment_id}:latest"
            dockerfile = os.path.join(build_workspace, "Dockerfile")
            if not os.path.exists(dockerfile):
                # Fallback to default python or standard Dockerfile if missing
                dockerfile = os.path.join(build_workspace, "Dockerfile.backend")

            build_result = BuildEngine.build_docker_image(
                image_tag=image_tag,
                dockerfile_path=dockerfile,
                build_context=build_workspace
            )
            if not build_result["success"]:
                return {
                    "status": DeploymentStatus.FAILED,
                    "error": build_result["message"]
                }

        return {
            "status": DeploymentStatus.SUCCESS,
            "workspace": build_workspace
        }
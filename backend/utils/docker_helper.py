import logging
import subprocess
from typing import Tuple, Dict, Any

logger = logging.getLogger(__name__)


class DockerHelper:
    """Utility helper for building, tagging, pushing, and managing Docker containers programmatically."""

    @staticmethod
    def build_image(image_tag: str, dockerfile_path: str, build_context: str) -> Tuple[bool, str]:
        """Builds a Docker image using the Docker CLI."""
        try:
            logger.info(f"Building Docker image '{image_tag}' using Dockerfile at '{dockerfile_path}'")
            
            cmd = [
                "docker", "build",
                "-t", image_tag,
                "-f", dockerfile_path,
                build_context
            ]

            result = subprocess.run(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                check=False
            )

            if result.returncode != 0:
                error_output = result.stderr.strip() or result.stdout.strip()
                logger.error(f"Docker build failed for {image_tag}: {error_output}")
                return False, f"Docker build failed: {error_output}"

            logger.info(f"Successfully built Docker image: {image_tag}")
            return True, "Docker image built successfully."

        except FileNotFoundError:
            error_msg = "Docker CLI is not installed or not available in the system PATH."
            logger.error(error_msg)
            return False, error_msg
        except Exception as e:
            error_msg = f"Unexpected error during Docker build: {str(e)}"
            logger.error(error_msg)
            return False, error_msg

    @staticmethod
    def push_image(image_tag: str) -> Tuple[bool, str]:
        """Pushes a built Docker image to a container registry (e.g., Docker Hub, ECR)."""
        try:
            logger.info(f"Pushing Docker image: {image_tag}")
            
            cmd = ["docker", "push", image_tag]
            result = subprocess.run(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                check=False
            )

            if result.returncode != 0:
                error_output = result.stderr.strip() or result.stdout.strip()
                logger.error(f"Docker push failed for {image_tag}: {error_output}")
                return False, f"Docker push failed: {error_output}"

            logger.info(f"Successfully pushed Docker image: {image_tag}")
            return True, "Docker image pushed successfully."

        except Exception as e:
            error_msg = f"Unexpected error during Docker push: {str(e)}"
            logger.error(error_msg)
            return False, error_msg
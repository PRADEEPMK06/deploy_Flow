import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from backend.repositories.deployment_repository import deployment_repository
from backend.utils.k8s_helper import K8sHelper
from backend.models.deployment import DeploymentStatus

logger = logging.getLogger(__name__)


class RollbackService:
    """Service responsible for rolling back failed deployments to a previous stable state."""

    @staticmethod
    def rollback_deployment(db: Session, deployment_id: int) -> Dict[str, Any]:
        """Rolls back a specific deployment by reverting to the previous successful release or revision."""
        logger.info(f"Initiating rollback for deployment ID: {deployment_id}")

        # Step 1: Fetch the target deployment record
        deployment = deployment_repository.get(db=db, id=deployment_id)
        if not deployment:
            logger.error(f"Deployment ID {deployment_id} not found for rollback.")
            return {
                "success": False,
                "error": f"Deployment with ID {deployment_id} does not exist."
            }

        # Step 2: Find the previous successful deployment for the same repository
        previous_deployments = deployment_repository.get_by_repository(
            db=db,
            repository_id=deployment.repository_id,
            skip=0,
            limit=5
        )

        stable_deployment = None
        for dep in previous_deployments:
            if dep.id != deployment_id and dep.status == DeploymentStatus.SUCCESS:
                stable_deployment = dep
                break

        if not stable_deployment:
            logger.warning(f"No previous successful deployment found to roll back repository ID {deployment.repository_id}.")
            return {
                "success": False,
                "error": "No previous stable deployment available for rollback."
            }

        # Step 3: Execute cluster rollback using K8sHelper (reverting to previous image/revision)
        deployment_name = f"deployflow-app-{deployment.repository_id}"
        target_image_tag = f"deployflow_app_{stable_deployment.id}:latest"

        logger.info(f"Rolling back deployment {deployment_name} to image tag: {target_image_tag}")
        rollback_success, rollback_msg = K8sHelper.rollback_deployment(
            deployment_name=deployment_name,
            image_tag=target_image_tag
        )

        if not rollback_success:
            logger.error(f"Rollback failed for deployment #{deployment_id}: {rollback_msg}")
            return {
                "success": False,
                "error": f"Kubernetes rollback failed: {rollback_msg}"
            }

        # Step 4: Update deployment statuses in DB
        deployment_repository.update(
            db=db,
            db_obj=deployment,
            obj_in={"status": DeploymentStatus.ROLLED_BACK}
        )

        logger.info(f"Rollback successfully completed for deployment #{deployment_id} -> reverted to #{stable_deployment.id}")
        return {
            "success": True,
            "message": f"Successfully rolled back to deployment #{stable_deployment.id}",
            "rolled_back_to_id": stable_deployment.id
        }
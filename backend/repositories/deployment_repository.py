from typing import List, Optional
from sqlalchemy.orm import Session

from backend.repositories.base import CRUDBase
from backend.models.deployment import Deployment
from backend.schemas.deployment import DeploymentCreate, DeploymentUpdate


class CRUDDeployment(CRUDBase[Deployment, DeploymentCreate, DeploymentUpdate]):
    """Repository for managing deployment records and operations."""

    def get_by_repository(self, db: Session, *, repository_id: int, skip: int = 0, limit: int = 100) -> List[Deployment]:
        """Retrieve all deployments associated with a specific repository ID."""
        return (
            db.query(self.model)
            .filter(self.model.repository_id == repository_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_recent_deployments(self, db: Session, *, limit: int = 10) -> List[Deployment]:
        """Retrieve recent deployments ordered by creation timestamp."""
        return (
            db.query(self.model)
            .order_by(self.model.created_at.desc())
            .limit(limit)
            .all()
        )


deployment_repository = CRUDDeployment(Deployment)
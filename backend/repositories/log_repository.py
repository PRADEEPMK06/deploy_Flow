from typing import List
from sqlalchemy.orm import Session

from backend.repositories.base import CRUDBase
from backend.models.deployment_log import DeploymentLog
from backend.schemas.log import LogCreate, LogUpdate


class CRUDLog(CRUDBase[DeploymentLog, LogCreate, LogUpdate]):
    """Repository for managing deployment execution and container logs."""

    def get_by_deployment(self, db: Session, *, deployment_id: int, skip: int = 0, limit: int = 1000) -> List[DeploymentLog]:
        """Retrieve all log entries associated with a specific deployment ID."""
        return (
            db.query(self.model)
            .filter(self.model.deployment_id == deployment_id)
            .order_by(self.model.timestamp.asc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create_log(self, db: Session, *, deployment_id: int, log_level: str, message: str) -> DeploymentLog:
        """Helper to quickly insert a log entry for a deployment."""
        log_in = LogCreate(
            deployment_id=deployment_id,
            log_level=log_level,
            message=message
        )
        return self.create(db=db, obj_in=log_in)


log_repository = CRUDLog(DeploymentLog)
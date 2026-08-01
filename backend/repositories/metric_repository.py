from typing import List, Optional
from sqlalchemy.orm import Session

from backend.repositories.base import CRUDBase
from backend.models.deployment_metric import DeploymentMetric
from backend.schemas.metric import MetricCreate, MetricUpdate


class CRUDMetric(CRUDBase[DeploymentMetric, MetricCreate, MetricUpdate]):
    """Repository for managing deployment performance and resource utilization metrics."""

    def get_by_deployment(self, db: Session, *, deployment_id: int, skip: int = 0, limit: int = 100) -> List[DeploymentMetric]:
        """Retrieve all performance metrics associated with a specific deployment ID."""
        return (
            db.query(self.model)
            .filter(self.model.deployment_id == deployment_id)
            .order_by(self.model.timestamp.asc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create_metric(
        self,
        db: Session,
        *,
        deployment_id: int,
        cpu_usage: float,
        memory_usage: float,
        status_code: Optional[int] = None,
        response_time_ms: Optional[float] = None
    ) -> DeploymentMetric:
        """Helper to quickly insert a metric snapshot for a deployment."""
        metric_in = MetricCreate(
            deployment_id=deployment_id,
            cpu_usage=cpu_usage,
            memory_usage=memory_usage,
            status_code=status_code,
            response_time_ms=response_time_ms
        )
        return self.create(db=db, obj_in=metric_in)


metric_repository = CRUDMetric(DeploymentMetric)
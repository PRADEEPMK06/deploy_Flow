from typing import List, Optional
from sqlalchemy.orm import Session

from backend.models.deployment import Deployment
from backend.models.deployment_history import DeploymentHistory
from backend.models.deployment_log import DeploymentLog
from backend.models.deployment_metric import DeploymentMetric
from backend.schemas.deployment import DeploymentCreate


class DeploymentService:
    """Service layer for managing deployments, pipeline logs, and metrics."""

    @staticmethod
    def create_deployment(db: Session, deployment_in: DeploymentCreate) -> Deployment:
        """Trigger a new deployment for a repository."""
        db_deployment = Deployment(
            repository_id=deployment_in.repository_id,
            status="QUEUED",
            current_stage="QUEUED",
        )
        db.add(db_deployment)
        db.commit()
        db.refresh(db_deployment)
        return db_deployment

    @staticmethod
    def get_deployment(db: Session, deployment_id: int) -> Optional[Deployment]:
        """Retrieve a deployment by its ID."""
        return db.query(Deployment).filter(Deployment.id == deployment_id).first()

    @staticmethod
    def get_deployments(db: Session, skip: int = 0, limit: int = 100) -> List[Deployment]:
        """Retrieve a list of deployments."""
        return db.query(Deployment).order_by(Deployment.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def update_deployment_status(
        db: Session,
        deployment_id: int,
        status: str,
        current_stage: str,
        image_tag: Optional[str] = None,
        app_url: Optional[str] = None,
        error_message: Optional[str] = None,
    ) -> Optional[Deployment]:
        """Update deployment status, stage, and execution metadata."""
        db_deployment = DeploymentService.get_deployment(db, deployment_id)
        if not db_deployment:
            return None

        db_deployment.status = status
        db_deployment.current_stage = current_stage
        if image_tag is not None:
            db_deployment.image_tag = image_tag
        if app_url is not None:
            db_deployment.app_url = app_url
        if error_message is not None:
            db_deployment.error_message = error_message

        db.commit()
        db.refresh(db_deployment)
        return db_deployment

    @staticmethod
    def add_log(db: Session, deployment_id: int, message: str, level: str = "INFO") -> DeploymentLog:
        """Add an execution log entry for a deployment."""
        db_log = DeploymentLog(
            deployment_id=deployment_id,
            level=level,
            message=message,
        )
        db.add(db_log)
        db.commit()
        db.refresh(db_log)
        return db_log

    @staticmethod
    def add_metric(db: Session, deployment_id: int, metric_name: str, metric_value: float, unit: str = "") -> DeploymentMetric:
        """Add a performance or resource metric for a deployment."""
        db_metric = DeploymentMetric(
            deployment_id=deployment_id,
            metric_name=metric_name,
            metric_value=metric_value,
            unit=unit,
        )
        db.add(db_metric)
        db.commit()
        db.refresh(db_metric)
        return db_metric

    @staticmethod
    def add_history_record(
        db: Session,
        deployment_id: int,
        action: str,
        previous_image_tag: Optional[str] = None,
        new_image_tag: Optional[str] = None,
    ) -> DeploymentHistory:
        """Record a historical action (e.g., deployment, rollback) for a deployment."""
        db_history = DeploymentHistory(
            deployment_id=deployment_id,
            action=action,
            previous_image_tag=previous_image_tag,
            new_image_tag=new_image_tag,
        )
        db.add(db_history)
        db.commit()
        db.refresh(db_history)
        return db_history
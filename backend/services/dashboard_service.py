from sqlalchemy.orm import Session

from backend.models.deployment import Deployment
from backend.models.repository import Repository
from backend.schemas.dashboard import DashboardOverviewResponse


class DashboardService:
    """Service layer for dashboard statistics and overview data."""

    @staticmethod
    def get_dashboard_overview(db: Session) -> DashboardOverviewResponse:
        """Retrieve aggregated overview statistics and recent activities."""
        total_repositories = db.query(Repository).count()
        total_deployments = db.query(Deployment).count()

        active_deployments = (
            db.query(Deployment)
            .filter(Deployment.status.in_(["QUEUED", "IN_PROGRESS", "BUILDING", "DEPLOYING"]))
            .count()
        )

        failed_deployments = db.query(Deployment).filter(Deployment.status == "FAILED").count()

        recent_deployments = (
            db.query(Deployment)
            .order_by(Deployment.created_at.desc())
            .limit(5)
            .all()
        )

        active_repositories = (
            db.query(Repository)
            .order_by(Repository.created_at.desc())
            .limit(5)
            .all()
        )

        return DashboardOverviewResponse(
            total_repositories=total_repositories,
            total_deployments=total_deployments,
            active_deployments=active_deployments,
            failed_deployments=failed_deployments,
            recent_deployments=recent_deployments,
            active_repositories=active_repositories,
        )
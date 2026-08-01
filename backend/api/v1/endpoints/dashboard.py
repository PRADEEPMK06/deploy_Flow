import logging
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.schemas.dashboard import DashboardOverviewResponse
from backend.services.dashboard_service import DashboardService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get(
    "",
    response_model=DashboardOverviewResponse,
    status_code=status.HTTP_200_OK,
    summary="Dashboard Overview",
    description="Retrieve system-wide summary statistics, active repositories, and recent deployments.",
)
def get_dashboard_overview(db: Session = Depends(get_db)) -> DashboardOverviewResponse:
    """Get overall dashboard metrics and overview information."""
    logger.info("Received request for dashboard overview statistics")
    service = DashboardService(db)
    overview = service.get_overview()
    return DashboardOverviewResponse.model_validate(overview)
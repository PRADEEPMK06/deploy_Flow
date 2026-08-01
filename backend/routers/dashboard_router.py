from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.schemas.dashboard import DashboardOverviewResponse
from backend.services.dashboard_service import DashboardService

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/overview", response_model=DashboardOverviewResponse)
def get_dashboard_overview(db: Session = Depends(get_db)):
    """Retrieve aggregated overview statistics and recent activities for the dashboard."""
    return DashboardService.get_dashboard_overview(db)
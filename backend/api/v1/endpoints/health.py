import logging
from fastapi import APIRouter, status
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter()


class HealthResponse(BaseModel):
    """Health check response schema."""

    status: str
    version: str


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Health Check",
    description="Check the health status of the DeployFlow API service.",
)
def health_check() -> HealthResponse:
    """Perform a health check on the API."""
    logger.info("Health check endpoint invoked")
    return HealthResponse(status="healthy", version="1.0.0")
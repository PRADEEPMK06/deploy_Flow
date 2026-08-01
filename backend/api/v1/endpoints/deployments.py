import logging
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.schemas.deployment import DeploymentCreate, DeploymentResponse
from backend.schemas.log import LogResponse
from backend.schemas.metric import MetricResponse
from backend.services.deployment_service import DeploymentService
from backend.services.rollback_service import RollbackService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "",
    response_model=DeploymentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Trigger Deployment",
    description="Trigger a new deployment pipeline for a registered repository.",
)
def create_deployment(
    deployment_in: DeploymentCreate, db: Session = Depends(get_db)
) -> DeploymentResponse:
    """Trigger a new deployment."""
    logger.info("Received request to trigger deployment for repository ID: %d", deployment_in.repository_id)
    service = DeploymentService(db)
    deployment = service.trigger_deployment(deployment_in.repository_id)
    return DeploymentResponse.model_validate(deployment)


@router.get(
    "",
    response_model=List[DeploymentResponse],
    status_code=status.HTTP_200_OK,
    summary="List Deployments",
    description="Retrieve a list of all deployments across all repositories.",
)
def list_deployments(db: Session = Depends(get_db)) -> List[DeploymentResponse]:
    """List all deployments."""
    logger.info("Received request to list all deployments")
    service = DeploymentService(db)
    deployments = service.get_deployments()
    return [DeploymentResponse.model_validate(dep) for dep in deployments]


@router.get(
    "/{id}",
    response_model=DeploymentResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Deployment Details",
    description="Retrieve detailed status and pipeline stages for a specific deployment.",
)
def get_deployment(id: int, db: Session = Depends(get_db)) -> DeploymentResponse:
    """Get deployment details by ID."""
    logger.info("Received request to get deployment ID: %d", id)
    service = DeploymentService(db)
    deployment = service.get_deployment_by_id(id)
    return DeploymentResponse.model_validate(deployment)


@router.get(
    "/{id}/logs",
    response_model=List[LogResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Deployment Logs",
    description="Retrieve execution logs for a specific deployment.",
)
def get_deployment_logs(id: int, db: Session = Depends(get_db)) -> List[LogResponse]:
    """Get logs for a specific deployment."""
    logger.info("Received request to get logs for deployment ID: %d", id)
    service = DeploymentService(db)
    logs = service.get_deployment_logs(id)
    return [LogResponse.model_validate(log) for log in logs]


@router.get(
    "/{id}/metrics",
    response_model=List[MetricResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Deployment Metrics",
    description="Retrieve performance and resource metrics for a specific deployment.",
)
def get_deployment_metrics(id: int, db: Session = Depends(get_db)) -> List[MetricResponse]:
    """Get metrics for a specific deployment."""
    logger.info("Received request to get metrics for deployment ID: %d", id)
    service = DeploymentService(db)
    metrics = service.get_deployment_metrics(id)
    return [MetricResponse.model_validate(metric) for metric in metrics]


@router.post(
    "/{id}/rollback",
    response_model=DeploymentResponse,
    status_code=status.HTTP_200_OK,
    summary="Rollback Deployment",
    description="Rollback a deployment to its previous stable version.",
)
def rollback_deployment(id: int, db: Session = Depends(get_db)) -> DeploymentResponse:
    """Rollback a specific deployment."""
    logger.info("Received request to rollback deployment ID: %d", id)
    service = RollbackService(db)
    deployment = service.rollback_deployment(id)
    return DeploymentResponse.model_validate(deployment)
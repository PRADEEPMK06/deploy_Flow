from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.schemas.deployment import DeploymentCreate, DeploymentResponse
from backend.services.deployment_service import DeploymentService
from backend.services.repository_service import RepositoryService

router = APIRouter(prefix="/api/deployments", tags=["Deployments"])


@router.post("/", response_model=DeploymentResponse, status_code=status.HTTP_201_CREATED)
def trigger_deployment(deployment_in: DeploymentCreate, db: Session = Depends(get_db)):
    """Trigger a new deployment pipeline for a registered repository."""
    db_repo = RepositoryService.get_repository(db, deployment_in.repository_id)
    if not db_repo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repository not found.",
        )
    return DeploymentService.create_deployment(db, deployment_in)


@router.get("/", response_model=List[DeploymentResponse])
def list_deployments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retrieve a list of all deployments."""
    return DeploymentService.get_deployments(db, skip=skip, limit=limit)


@router.get("/{deployment_id}", response_model=DeploymentResponse)
def get_deployment(deployment_id: int, db: Session = Depends(get_db)):
    """Retrieve detailed information for a specific deployment by ID."""
    db_deployment = DeploymentService.get_deployment(db, deployment_id)
    if not db_deployment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deployment not found.",
        )
    return db_deployment
import logging
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.schemas.repository import RepositoryCreate, RepositoryResponse
from backend.services.repository_service import RepositoryService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "",
    response_model=RepositoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register Repository",
    description="Register and validate a new GitHub repository for deployment.",
)
def create_repository(
    repository_in: RepositoryCreate, db: Session = Depends(get_db)
) -> RepositoryResponse:
    """Register a new repository."""
    logger.info("Received request to register repository: %s", repository_in.repo_url)
    service = RepositoryService(db)
    repository = service.create_repository(repository_in)
    return RepositoryResponse.model_validate(repository)


@router.get(
    "",
    response_model=List[RepositoryResponse],
    status_code=status.HTTP_200_OK,
    summary="List Repositories",
    description="Retrieve a list of all registered repositories.",
)
def list_repositories(db: Session = Depends(get_db)) -> List[RepositoryResponse]:
    """List all registered repositories."""
    logger.info("Received request to list all repositories")
    service = RepositoryService(db)
    repositories = service.get_repositories()
    return [RepositoryResponse.model_validate(repo) for repo in repositories]


@router.get(
    "/{id}",
    response_model=RepositoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Repository by ID",
    description="Retrieve details of a specific repository by its unique identifier.",
)
def get_repository(id: int, db: Session = Depends(get_db)) -> RepositoryResponse:
    """Get a specific repository by ID."""
    logger.info("Received request to get repository ID: %d", id)
    service = RepositoryService(db)
    repository = service.get_repository_by_id(id)
    return RepositoryResponse.model_validate(repository)


@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Repository",
    description="Delete a registered repository by its unique identifier.",
)
def delete_repository(id: int, db: Session = Depends(get_db)) -> None:
    """Delete a repository by ID."""
    logger.info("Received request to delete repository ID: %d", id)
    service = RepositoryService(db)
    service.delete_repository(id)
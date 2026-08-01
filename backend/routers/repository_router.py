from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.schemas.repository import RepositoryCreate, RepositoryResponse
from backend.services.repository_service import RepositoryService

router = APIRouter(prefix="/api/repositories", tags=["Repositories"])


@router.post("/", response_model=RepositoryResponse, status_code=status.HTTP_201_CREATED)
def register_repository(repo_in: RepositoryCreate, db: Session = Depends(get_db)):
    """Register a new Git repository for deployment tracking."""
    existing_repo = RepositoryService.get_repository_by_url(db, repo_in.repo_url)
    if existing_repo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Repository with this URL is already registered.",
        )
    return RepositoryService.create_repository(db, repo_in)


@router.get("/", response_model=List[RepositoryResponse])
def list_repositories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retrieve a list of all registered repositories."""
    return RepositoryService.get_repositories(db, skip=skip, limit=limit)


@router.get("/{repo_id}", response_model=RepositoryResponse)
def get_repository(repo_id: int, db: Session = Depends(get_db)):
    """Retrieve detailed information for a specific repository by ID."""
    db_repo = RepositoryService.get_repository(db, repo_id)
    if not db_repo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repository not found.",
        )
    return db_repo


@router.delete("/{repo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_repository(repo_id: int, db: Session = Depends(get_db)):
    """Delete a registered repository by ID."""
    success = RepositoryService.delete_repository(db, repo_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repository not found.",
        )
    return None
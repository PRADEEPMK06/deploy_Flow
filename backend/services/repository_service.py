from typing import List, Optional
from sqlalchemy.orm import Session

from backend.models.repository import Repository
from backend.schemas.repository import RepositoryCreate


class RepositoryService:
    """Service layer for managing Git repositories."""

    @staticmethod
    def create_repository(db: Session, repo_in: RepositoryCreate) -> Repository:
        """Register a new Git repository."""
        db_repo = Repository(
            repo_url=repo_in.repo_url,
            name=repo_in.name,
            branch=repo_in.branch,
            project_type=repo_in.project_type,
            description=repo_in.description,
        )
        db.add(db_repo)
        db.commit()
        db.refresh(db_repo)
        return db_repo

    @staticmethod
    def get_repository(db: Session, repo_id: int) -> Optional[Repository]:
        """Retrieve a repository by its ID."""
        return db.query(Repository).filter(Repository.id == repo_id).first()

    @staticmethod
    def get_repository_by_url(db: Session, repo_url: str) -> Optional[Repository]:
        """Retrieve a repository by its Git URL."""
        return db.query(Repository).filter(Repository.repo_url == repo_url).first()

    @staticmethod
    def get_repositories(db: Session, skip: int = 0, limit: int = 100) -> List[Repository]:
        """Retrieve a list of registered repositories."""
        return db.query(Repository).offset(skip).limit(limit).all()

    @staticmethod
    def delete_repository(db: Session, repo_id: int) -> bool:
        """Delete a repository by its ID."""
        db_repo = RepositoryService.get_repository(db, repo_id)
        if not db_repo:
            return False
        db.delete(db_repo)
        db.commit()
        return True
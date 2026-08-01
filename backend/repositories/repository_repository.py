from typing import Optional
from sqlalchemy.orm import Session

from backend.repositories.base import CRUDBase
from backend.models.repository import Repository
from backend.schemas.repository import RepositoryCreate, RepositoryUpdate


class CRUDRepository(CRUDBase[Repository, RepositoryCreate, RepositoryUpdate]):
    """Repository for managing registered git repositories and metadata."""

    def get_by_url(self, db: Session, *, repo_url: str) -> Optional[Repository]:
        """Retrieve a registered repository by its git remote URL."""
        return db.query(self.model).filter(self.model.repo_url == repo_url).first()

    def get_by_name(self, db: Session, *, name: str) -> Optional[Repository]:
        """Retrieve a registered repository by its project name."""
        return db.query(self.model).filter(self.model.name == name).first()


RepositoryRepository = CRUDRepository(Repository)
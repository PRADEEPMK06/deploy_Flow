import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from backend.utils.git_helper import GitHelper
from backend.repositories.repository_repository import RepositoryRepository
from backend.schemas.repository import RepositoryCreate

logger = logging.getLogger(__name__)


class RepositoryEngine:
    """Engine responsible for repository validation, branch discovery, and git lifecycle operations."""

    @staticmethod
    def validate_and_register_repository(db: Session, repo_in: RepositoryCreate) -> Dict[str, Any]:
        """Validates a repository URL (checks accessibility/branches) and registers it in the database."""
        logger.info(f"Validating repository URL: {repo_in.repo_url}")

        # Step 1: Verify remote git connectivity & get available branches
        is_valid, branches_or_error = GitHelper.validate_repository(repo_in.repo_url)
        if not is_valid:
            logger.error(f"Repository validation failed for {repo_in.repo_url}: {branches_or_error}")
            return {
                "success": False,
                "error": f"Invalid repository or unable to connect: {branches_or_error}"
            }

        # Step 2: Create repository record in database via repository layer
        try:
            db_repo = RepositoryRepository.create(db=db, obj_in=repo_in)
            logger.info(f"Repository successfully registered with ID: {db_repo.id}")
            return {
                "success": True,
                "repository": db_repo,
                "available_branches": branches_or_error
            }
        except Exception as e:
            logger.error(f"Database error while saving repository: {e}")
            return {
                "success": False,
                "error": f"Database error: {str(e)}"
            }

    @staticmethod
    def fetch_repository_branches(repo_url: str) -> List[str]:
        """Fetches a list of remote branches available for a given git repository URL."""
        is_valid, result = GitHelper.validate_repository(repo_url)
        if not is_valid:
            logger.warning(f"Could not fetch branches for {repo_url}: {result}")
            return []
        return result
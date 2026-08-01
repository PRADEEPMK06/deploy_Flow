import logging
import subprocess
import os
import shutil
from typing import Tuple, List, Union

logger = logging.getLogger(__name__)


class GitHelper:
    """Utility helper for interacting with Git repositories (cloning, branch validation, metadata extraction)."""

    @staticmethod
    def validate_repository(repo_url: str) -> Tuple[bool, Union[List[str], str]]:
        """Validates if a remote Git repository is accessible and retrieves its available branches."""
        try:
            logger.info(f"Validating git remote repository URL: {repo_url}")
            
            cmd = ["git", "ls-remote", "--heads", repo_url]
            result = subprocess.run(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                timeout=15,
                check=False
            )

            if result.returncode != 0:
                error_output = result.stderr.strip() or "Repository not found or authentication failed."
                logger.error(f"Git remote validation failed for {repo_url}: {error_output}")
                return False, error_output

            # Parse branch names from ls-remote output (format: <hash>\trefs/heads/<branch_name>)
            branches = []
            for line in result.stdout.splitlines():
                if "\trefs/heads/" in line:
                    branch_name = line.split("\trefs/heads/")[-1].strip()
                    branches.append(branch_name)

            if not branches:
                return False, "No branches found in the repository."

            logger.info(f"Successfully validated repository. Found {len(branches)} branches.")
            return True, branches

        except subprocess.TimeoutExpired:
            error_msg = "Git remote validation timed out while contacting the repository."
            logger.error(error_msg)
            return False, error_msg
        except FileNotFoundError:
            error_msg = "Git CLI is not installed or not available in the system PATH."
            logger.error(error_msg)
            return False, error_msg
        except Exception as e:
            error_msg = f"Unexpected error during repository validation: {str(e)}"
            logger.error(error_msg)
            return False, error_msg

    @staticmethod
    def clone_repository(repo_url: str, branch: str, target_dir: str) -> bool:
        """Clones a specific branch of a git repository to a target directory."""
        try:
            if os.path.exists(target_dir):
                logger.info(f"Target directory '{target_dir}' already exists. Cleaning up before clone.")
                shutil.rmtree(target_dir)

            logger.info(f"Cloning repository {repo_url} (branch: {branch}) into {target_dir}")
            
            cmd = [
                "git", "clone",
                "--branch", branch,
                "--single-branch",
                "--depth", "1",
                repo_url,
                target_dir
            ]

            result = subprocess.run(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                timeout=60,
                check=False
            )

            if result.returncode != 0:
                error_output = result.stderr.strip() or result.stdout.strip()
                logger.error(f"Git clone failed: {error_output}")
                return False

            logger.info("Repository cloned successfully.")
            return True

        except subprocess.TimeoutExpired:
            logger.error("Git clone timed out.")
            return False
        except Exception as e:
            logger.error(f"Unexpected error during git clone: {str(e)}")
            return False
import logging
from typing import Any, Dict, Optional
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


class DeployFlowException(Exception):
    """Base exception for all DeployFlow custom exceptions."""

    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class RepositoryNotFoundError(DeployFlowException):
    """Raised when a repository cannot be found."""

    def __init__(self, message: str = "Repository not found") -> None:
        super().__init__(message=message, status_code=status.HTTP_404_NOT_FOUND)


class DeploymentNotFoundError(DeployFlowException):
    """Raised when a deployment cannot be found."""

    def __init__(self, message: str = "Deployment not found") -> None:
        super().__init__(message=message, status_code=status.HTTP_404_NOT_FOUND)


class GitCloneError(DeployFlowException):
    """Raised when cloning a git repository fails."""

    def __init__(self, message: str = "Failed to clone git repository") -> None:
        super().__init__(message=message, status_code=status.HTTP_400_BAD_REQUEST)


class BuildError(DeployFlowException):
    """Raised when building a container image fails."""

    def __init__(self, message: str = "Failed to build container image") -> None:
        super().__init__(message=message, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DeploymentExecutionError(DeployFlowException):
    """Raised when executing a deployment pipeline fails."""

    def __init__(self, message: str = "Deployment execution failed") -> None:
        super().__init__(message=message, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


def register_exception_handlers(app: FastAPI) -> None:
    """Register global exception handlers for the FastAPI application."""

    @app.exception_handler(DeployFlowException)
    async def deployflow_exception_handler(
        request: Request, exc: DeployFlowException
    ) -> JSONResponse:
        logger.error(
            "DeployFlow exception occurred: %s | Path: %s | Details: %s",
            exc.message,
            request.url.path,
            exc.details,
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": True,
                "message": exc.message,
                "details": exc.details,
            },
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(
        request: Request, exc: Exception
    ) -> JSONResponse:
        logger.exception(
            "Unhandled internal server error occurred: %s | Path: %s",
            str(exc),
            request.url.path,
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": True,
                "message": "Internal server error",
                "details": {"exception": str(exc)},
            },
        )
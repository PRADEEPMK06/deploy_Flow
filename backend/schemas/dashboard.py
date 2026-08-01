from typing import List
from pydantic import BaseModel, ConfigDict, Field

from backend.schemas.deployment import DeploymentResponse
from backend.schemas.repository import RepositoryResponse


class DashboardOverviewResponse(BaseModel):
    """Schema for dashboard overview statistics and recent activities."""

    total_repositories: int = Field(..., description="Total number of registered repositories")
    total_deployments: int = Field(..., description="Total number of recorded deployments")
    active_deployments: int = Field(..., description="Number of currently running or queued deployments")
    failed_deployments: int = Field(..., description="Number of failed deployments")
    recent_deployments: List[DeploymentResponse] = Field(default_factory=list, description="List of recent deployments")
    active_repositories: List[RepositoryResponse] = Field(default_factory=list, description="List of recently registered repositories")

    model_config = ConfigDict(from_attributes=True)
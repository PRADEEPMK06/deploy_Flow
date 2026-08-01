from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class RepositoryBase(BaseModel):
    """Base schema for repository fields."""

    repo_url: str = Field(..., description="Git repository URL")
    name: str = Field(..., description="Repository name")
    branch: str = Field(default="main", description="Git branch to deploy")
    project_type: Optional[str] = Field(None, description="Detected project type/framework")
    description: Optional[str] = Field(None, description="Repository description")


class RepositoryCreate(RepositoryBase):
    """Schema for registering a new repository."""

    pass


class RepositoryResponse(RepositoryBase):
    """Schema for repository response data."""

    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
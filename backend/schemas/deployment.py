from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class DeploymentBase(BaseModel):
    """Base schema for deployment fields."""

    repository_id: int = Field(..., description="ID of the repository being deployed")


class DeploymentCreate(DeploymentBase):
    """Schema for triggering a new deployment."""

    pass


class DeploymentResponse(DeploymentBase):
    """Schema for deployment response data."""

    id: int
    status: str
    current_stage: str
    image_tag: Optional[str] = None
    app_url: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
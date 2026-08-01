from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class LogBase(BaseModel):
    """Base schema for deployment log fields."""

    level: str = Field(default="INFO", description="Log severity level (e.g., INFO, ERROR)")
    message: str = Field(..., description="Log message content")


class LogCreate(LogBase):
    """Schema for creating a new deployment log."""

    deployment_id: int = Field(..., description="ID of the associated deployment")


class LogResponse(LogBase):
    """Schema for deployment log response data."""

    id: int
    deployment_id: int
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
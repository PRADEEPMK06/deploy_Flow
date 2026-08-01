from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class MetricBase(BaseModel):
    """Base schema for deployment metric fields."""

    metric_name: str = Field(..., description="Name of the metric (e.g., cpu_usage, build_duration)")
    metric_value: float = Field(..., description="Numerical value of the metric")
    unit: str = Field(default="", description="Unit of measurement (e.g., %, seconds, MB)")


class MetricCreate(MetricBase):
    """Schema for creating a new deployment metric."""

    deployment_id: int = Field(..., description="ID of the associated deployment")


class MetricResponse(MetricBase):
    """Schema for deployment metric response data."""

    id: int
    deployment_id: int
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
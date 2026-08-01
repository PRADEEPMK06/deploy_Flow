from datetime import datetime
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from backend.core.database import Base


class DeploymentMetric(Base):
    """Database model for deployment performance and resource metrics."""

    __tablename__ = "deployment_metrics"

    id = Column(Integer, primary_key=True, index=True)
    deployment_id = Column(Integer, ForeignKey("deployments.id", ondelete="CASCADE"), nullable=False)
    metric_name = Column(String(100), nullable=False)
    metric_value = Column(Float, nullable=False)
    unit = Column(String(20), default="", nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    deployment = relationship("Deployment", back_populates="metrics")
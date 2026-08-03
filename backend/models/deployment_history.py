from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from backend.core.database import Base


class DeploymentHistory(Base):
    """Database model for tracking history and logs of deployments."""

    __tablename__ = "deployment_history"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    deployment_id = Column(Integer, ForeignKey("deployments.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), nullable=False)
    message = Column(Text, default="", nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    deployment = relationship("backend.models.deployment.Deployment", back_populates="history")
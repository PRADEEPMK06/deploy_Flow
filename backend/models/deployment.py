from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from backend.core.database import Base


class Deployment(Base):
    """Database model for application deployments."""

    __tablename__ = "deployments"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    repository_id = Column(Integer, ForeignKey("repositories.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="QUEUED", nullable=False)
    current_stage = Column(String(100), default="QUEUED", nullable=False)
    image_tag = Column(String(255), nullable=True)
    app_url = Column(String(512), nullable=True)
    error_message = Column(String(1024), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    repository = relationship("backend.models.repository.Repository", back_populates="deployments")
    logs = relationship("backend.models.deployment_log.DeploymentLog", back_populates="deployment", cascade="all, delete-orphan")
    metrics = relationship("backend.models.deployment_metric.DeploymentMetric", back_populates="deployment", cascade="all, delete-orphan")
    history = relationship("backend.models.deployment_history.DeploymentHistory", back_populates="deployment", cascade="all, delete-orphan")
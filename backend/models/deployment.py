from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from backend.core.database import Base


class Deployment(Base):
    """Database model for application deployments."""

    __tablename__ = "deployments"

    id = Column(Integer, primary_key=True, index=True)
    repository_id = Column(Integer, ForeignKey("repositories.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="QUEUED", nullable=False)
    current_stage = Column(String(100), default="QUEUED", nullable=False)
    image_tag = Column(String(255), nullable=True)
    app_url = Column(String(512), nullable=True)
    error_message = Column(String(1024), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    repository = relationship("Repository", back_populates="deployments")
    logs = relationship("DeploymentLog", back_populates="deployment", cascade="all, delete-orphan")
    metrics = relationship("DeploymentMetric", back_populates="deployment", cascade="all, delete-orphan")
    history = relationship("DeploymentHistory", back_populates="deployment", cascade="all, delete-orphan")
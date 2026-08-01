from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.orm import relationship

from backend.core.database import Base


class Repository(Base):
    """Database model for registered Git repositories."""

    __tablename__ = "repositories"

    id = Column(Integer, primary_key=True, index=True)
    repo_url = Column(String(512), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    branch = Column(String(100), default="main", nullable=False)
    project_type = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    deployments = relationship("Deployment", back_populates="repository", cascade="all, delete-orphan")
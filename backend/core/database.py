import logging
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from backend.core.config import settings

logger = logging.getLogger(__name__)

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[SessionLocal, None, None]:
    """Provide a database session dependency for FastAPI endpoints."""
    db = SessionLocal()
    try:
        logger.debug("Database session created successfully.")
        yield db
    except Exception as e:
        logger.error("Database session error: %s", str(e))
        db.rollback()
        raise
    finally:
        logger.debug("Database session closed.")
        db.close()
import enum


class PipelineStageEnum(str, enum.Enum):
    """Enumeration of pipeline stages for deployments."""

    QUEUED = "QUEUED"
    CLONING = "CLONING"
    DETECTING = "DETECTING"
    BUILDING = "BUILDING"
    TESTING = "TESTING"
    DEPLOYING = "DEPLOYING"
    HEALTH_CHECK = "HEALTH_CHECK"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    ROLLED_BACK = "ROLLED_BACK"
from fastapi import APIRouter

from backend.api.v1.endpoints import (
    dashboard,
    deployments,
    health,
    repositories,
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(repositories.router, prefix="/repositories", tags=["Repositories"])
api_router.include_router(deployments.router, prefix="/deployments", tags=["Deployments"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
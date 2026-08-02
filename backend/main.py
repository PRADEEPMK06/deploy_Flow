from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from backend.routers import deployment_router, repository_router, dashboard_router
from backend.api.v1.endpoints import health

app = FastAPI(title="DeployFlow API")

app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(repository_router.router)
app.include_router(deployment_router.router)
app.include_router(dashboard_router.router)

# Serve React static assets if the static folder exists
if os.path.exists("/app/static"):
    app.mount("/assets", StaticFiles(directory="/app/static/assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_react(full_path: str):
        # Allow API routes to pass through
        if full_path.startswith("api/"):
            return {"error": "Not found"}
        
        file_path = os.path.join("/app/static", full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse("/app/static/index.html")